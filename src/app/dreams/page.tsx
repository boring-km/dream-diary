import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCards, dailyPickIndex } from "@/lib/dream-data";
import { DRAWERS } from "@/lib/drawers";
import { earnedBadges } from "@/lib/badges";
import HandIcon, { DrawerPull } from "@/components/HandIcon";
import SearchOverlay from "@/components/SearchOverlay";
import TodayDig from "@/components/TodayDig";

export default async function DresserPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cards = await fetchCards();

  if (cards.length === 0) {
    return (
      <div className="view-in flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-serif text-xl text-ink">아직 발행한 꿈이 없어요.</p>
        <p className="mt-2 text-sm text-ink-faint">깬 직후가 골든타임이에요.</p>
        <Link
          href="/dreams/new"
          className="mt-7 rounded-full bg-blue px-7 py-2.5 text-sm font-medium text-paper transition hover:bg-blue-deep"
        >
          첫 꿈 적기
        </Link>
      </div>
    );
  }

  const counts = new Map<string, number>();
  for (const c of cards) counts.set(c.drawer, (counts.get(c.drawer) ?? 0) + 1);

  // 오늘의 발굴 — 하루 동안 고정된 랜덤 1장.
  const daySeed = new Date().toISOString().slice(0, 10);
  const dig = cards[dailyPickIndex(cards.length, daySeed)];

  const badges = earnedBadges({
    count: cards.length,
    createdAts: cards.map((c) => c.created_at),
  });

  return (
    <div className="view-in flex flex-1 flex-col">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="font-hand text-[1.9rem] leading-none text-ink">dream</h1>
        <p className="font-serif text-[0.82rem] text-ink-faint">
          발행한 꿈 <b className="font-bold text-blue-deep">{cards.length}</b>
        </p>
      </header>

      {dig && <TodayDig card={dig} />}

      {badges.length > 0 && (
        <ul className="mb-6 flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b.key}
              className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[0.74rem] text-ink-soft"
            >
              <HandIcon name={b.icon} size={16} />
              {b.label}
            </li>
          ))}
        </ul>
      )}

      <nav className="flex flex-col gap-2">
        {DRAWERS.map((d) => {
          const n = counts.get(d.key) ?? 0;
          return (
            <Link
              key={d.key}
              href={`/dreams/drawer/${d.key}`}
              className={`group flex items-center gap-3 rounded-[7px] border border-line bg-paper px-4 py-6 transition hover:-translate-y-px hover:bg-paper-deep active:translate-y-px ${
                d.deep ? "opacity-[0.84]" : ""
              }`}
            >
              <DrawerPull className="shrink-0 opacity-85" />
              <span
                className={`font-serif text-[1.05rem] ${
                  d.deep ? "text-ink-soft" : "text-ink"
                }`}
              >
                {d.name}
              </span>
              <span className="ml-auto text-[0.78rem] text-ink-faint">
                {n === 0 ? "비어 있음" : `${n}장${d.note ? ` · ${d.note}` : ""}`}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 flex items-center justify-between text-[0.78rem] text-ink-faint">
        <Link href="/dreams/export" className="transition hover:text-blue-deep">
          내보내기
        </Link>
        <form action="/auth/signout" method="post">
          <button className="transition hover:text-blue-deep">로그아웃</button>
        </form>
      </div>

      {/* 적기 — 늘 손 닿는 곳, 조용하게 */}
      <Link
        href="/dreams/new"
        aria-label="꿈 적기"
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-blue px-6 py-3 text-sm font-medium text-paper shadow-[0_6px_20px_oklch(0.45_0.12_258/.25)] transition hover:bg-blue-deep"
      >
        오늘 꿈 적기
      </Link>

      {/* 검색 — 숨은 비상구. 닫으면 흔적 0 */}
      <SearchOverlay
        cards={cards.map((c) => ({
          id: c.id,
          no: c.no,
          content: c.content,
          title: c.title,
        }))}
      />
    </div>
  );
}
