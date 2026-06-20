import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCards } from "@/lib/dream-data";
import { drawerByKey } from "@/lib/drawers";
import { formatCardDate } from "@/lib/format";
import { feedbackLine } from "@/lib/feedback";
import { EMOTION_LABELS } from "@/lib/types";
import HandIcon from "@/components/HandIcon";
import { deleteDream } from "../actions";

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const card = (await fetchCards()).find((c) => c.id === id);
  if (!card) notFound();

  const drawer = drawerByKey(card.drawer)!;

  return (
    <article className="view-in flex flex-1 flex-col">
      <header className="mb-2 flex items-baseline justify-between">
        <Link
          href={`/dreams/drawer/${card.drawer}`}
          className="flex items-center gap-1.5 text-[0.9rem] text-ink-soft transition hover:text-blue-deep"
        >
          ‹ 서랍
        </Link>
        <span className="font-serif text-[0.82rem] text-ink-faint">
          {drawer.name}
        </span>
      </header>

      <p className="mt-4 font-hand text-[1.35rem] text-blue-deep">No.{card.no}</p>

      <div className="my-5">
        <HandIcon name={card.icon} size={72} />
      </div>

      <h1 className="whitespace-pre-wrap font-serif text-[1.15rem] leading-[1.95] text-ink">
        {card.content}
      </h1>

      <p className="mt-6 text-[0.86rem] italic text-ink-faint">
        {feedbackLine(card.emotion, card.id)}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2 text-[0.8rem]">
        {card.emotion && (
          <span className="rounded-full border border-line px-3 py-1 text-ink-soft">
            {EMOTION_LABELS[card.emotion]}
          </span>
        )}
        <span className="rounded-full border border-line px-3 py-1 text-ink-soft">
          {formatCardDate(card.dreamed_at)}
        </span>
        <span className="rounded-full border border-line px-3 py-1 text-ink-faint">
          {card.status === "public" ? "공개" : "나만 보기"}
        </span>
      </div>

      <footer className="mt-auto flex items-center gap-5 pt-10 text-[0.8rem] text-ink-faint">
        <Link
          href={`/dreams/${card.id}/edit`}
          className="transition hover:text-blue-deep"
        >
          다듬기
        </Link>
        <form action={deleteDream.bind(null, card.id)}>
          <button className="transition hover:text-blue-deep">버리기</button>
        </form>
      </footer>
    </article>
  );
}
