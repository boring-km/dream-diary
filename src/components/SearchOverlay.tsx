"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Lite = { id: string; no: number; content: string; title: string | null };

// 평소엔 흐릿한 돋보기. 눌러야 열리고, 닫으면 입력을 버려 흔적 0.
export default function SearchOverlay({ cards }: { cards: Lite[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return cards
      .filter(
        (c) =>
          c.content.toLowerCase().includes(t) ||
          (c.title ?? "").toLowerCase().includes(t),
      )
      .slice(0, 20);
  }, [q, cards]);

  function close() {
    setOpen(false);
    setQ(""); // 흔적 0
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="찾기"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-paper opacity-40 transition hover:scale-105 hover:opacity-95"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          stroke="var(--ink-soft)"
          strokeWidth={1.5}
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="8.5" cy="8.5" r="5.2" />
          <path d="M12.6 12.6 L17 17" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[480px] flex-col px-5 py-8">
        <div className="flex items-center gap-3">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="잊은 꿈의 한 조각…"
            className="w-full border-b border-line bg-transparent py-2 font-serif text-lg text-ink outline-none placeholder:text-ink-faint focus:border-blue"
          />
          <button
            type="button"
            onClick={close}
            className="shrink-0 text-[0.85rem] text-ink-faint transition hover:text-blue-deep"
          >
            닫기
          </button>
        </div>

        <ul className="mt-6 flex flex-col gap-1">
          {hits.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dreams/${c.id}`}
                onClick={close}
                className="flex items-baseline gap-3 rounded-md px-2 py-3 transition hover:bg-paper-deep"
              >
                <span className="shrink-0 font-hand text-[0.95rem] text-blue-deep">
                  No.{c.no}
                </span>
                <span className="truncate text-[0.9rem] text-ink-soft">
                  {c.content}
                </span>
              </Link>
            </li>
          ))}
          {q.trim() && hits.length === 0 && (
            <li className="px-2 py-6 text-center text-[0.85rem] text-ink-faint">
              걸리는 꿈이 없어요.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
