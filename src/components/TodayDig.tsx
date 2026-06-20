import Link from "next/link";
import HandIcon from "@/components/HandIcon";
import type { Card } from "@/lib/dream-data";

// 오늘의 발굴 — 자기보상. 더미에서 우연히 올라온 한 장.
export default function TodayDig({ card }: { card: Card }) {
  return (
    <Link
      href={`/dreams/${card.id}`}
      className="mb-8 flex items-center gap-4 rounded-[7px] border border-line bg-card px-4 py-4 transition hover:-translate-y-px hover:border-blue/40"
    >
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-line bg-paper">
        <HandIcon name={card.icon} size={34} />
      </div>
      <div className="min-w-0">
        <p className="font-hand text-[0.92rem] text-ink-faint">오늘의 발굴</p>
        <p className="font-hand text-[1rem] text-blue-deep">No.{card.no}</p>
        <p className="mt-0.5 truncate text-[0.82rem] text-ink-soft">
          {card.content}
        </p>
      </div>
    </Link>
  );
}
