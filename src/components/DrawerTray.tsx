"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ICON_PATHS, type IconKey } from "@/lib/icons";

type TrayCard = { id: string; no: number; icon: IconKey };

const CARD = 112;

// 흩어진 자리 — id 기반 고정 좌표(마구잡이지만 늘 같은 자리).
const SEED: [number, number, number][] = [
  [0.05, 0.04, -7],
  [0.42, 0.12, 6],
  [0.16, 0.4, -3],
  [0.55, 0.46, 9],
  [0.02, 0.66, 4],
  [0.4, 0.7, -8],
  [0.3, 0.24, 2],
  [0.58, 0.28, -5],
];

function scatter(n: number, w: number, h: number) {
  const pad = 14;
  const maxX = Math.max(0, w - CARD - pad);
  const maxY = Math.max(0, h - CARD - pad * 2);
  return Array.from({ length: n }, (_, i) => {
    const s = SEED[i % SEED.length];
    // 같은 인덱스라도 한 바퀴 돌면 살짝 밀어 겹침 방지
    const ring = Math.floor(i / SEED.length) * 26;
    return {
      x: pad + s[0] * maxX,
      y: pad + s[1] * maxY + (ring % Math.max(1, maxY)),
      r: s[2],
    };
  });
}

export default function DrawerTray({ cards }: { cards: TrayCard[] }) {
  const trayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const tray = trayRef.current;
    if (!tray) return;
    const els = Array.from(
      tray.querySelectorAll<HTMLDivElement>("[data-card]"),
    );
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function place(animated: boolean) {
      const w = tray!.clientWidth;
      const h = tray!.clientHeight;
      const targets = scatter(els.length, w, h);
      const cx = w / 2 - CARD / 2;
      els.forEach((el, i) => {
        const t = targets[i];
        el.dataset.x = String(t.x);
        el.dataset.y = String(t.y);
        if (animated && !reduce) {
          el.style.transition = "none";
          el.style.transform = `translate(${cx}px, 14px) rotate(${
            i % 2 ? 8 : -8
          }deg)`;
          el.style.zIndex = String(i + 1);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              el.style.transition =
                "transform .6s cubic-bezier(.2,.85,.2,1)";
              el.style.transitionDelay = `${i * 0.05}s`;
              el.style.transform = `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg)`;
            }),
          );
        } else {
          el.style.transition = "none";
          el.style.transform = `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg)`;
          el.style.zIndex = String(i + 1);
        }
      });
    }

    place(true);

    // 드래그 + 탭→상세
    const cleanups: (() => void)[] = [];
    els.forEach((el) => {
      let sx = 0,
        sy = 0,
        ox = 0,
        oy = 0,
        moved = false,
        dragging = false;
      const down = (e: PointerEvent) => {
        dragging = true;
        moved = false;
        el.setPointerCapture(e.pointerId);
        ox = parseFloat(el.dataset.x ?? "0");
        oy = parseFloat(el.dataset.y ?? "0");
        sx = e.clientX;
        sy = e.clientY;
        el.style.transition = "none";
        el.style.zIndex = "999";
        el.classList.add("shadow-[0_14px_30px_oklch(0.45_0.12_258/.18)]");
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
        el.style.transform = `translate(${ox + dx}px, ${oy + dy}px) rotate(0deg)`;
      };
      const up = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("shadow-[0_14px_30px_oklch(0.45_0.12_258/.18)]");
        if (!moved) {
          router.push(`/dreams/${el.dataset.id}`);
          return;
        }
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        el.dataset.x = String(ox + dx);
        el.dataset.y = String(oy + dy);
      };
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      cleanups.push(() => {
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
      });
    });

    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    return () => cleanups.forEach((c) => c());
  }, [cards, router]);

  if (cards.length === 0) {
    return (
      <div className="mt-3 flex flex-1 items-center justify-center rounded-[7px] border-t border-line bg-paper-deep">
        <p className="text-[0.85rem] text-ink-faint">이 서랍은 아직 비어 있어요.</p>
      </div>
    );
  }

  return (
    <div
      ref={trayRef}
      className="relative mt-3 flex-1 touch-none overflow-hidden rounded-[7px] border-t border-line bg-paper-deep"
      style={{ minHeight: "70dvh" }}
    >
      {cards.map((c) => (
        <div
          key={c.id}
          data-card
          data-id={c.id}
          className="absolute left-0 top-0 grid h-[112px] w-[112px] cursor-grab place-items-center rounded-md border border-line bg-card shadow-[0_2px_6px_oklch(0.45_0.10_258/.10)] will-change-transform active:cursor-grabbing"
        >
          <span className="absolute left-2.5 top-1.5 font-hand text-[0.95rem] text-blue-deep">
            No.{c.no}
          </span>
          <svg
            width={54}
            height={54}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--blue)"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={ICON_PATHS[c.icon]} />
          </svg>
        </div>
      ))}
      <span className="pointer-events-none absolute bottom-3 left-4 text-[0.74rem] text-ink-faint">
        뒤적여 꺼내고, 카드를 누르면 펼쳐집니다
      </span>
    </div>
  );
}
