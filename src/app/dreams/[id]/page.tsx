import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dreamTitle, formatDreamedAt } from "@/lib/format";
import { EMOTION_LABELS, type Dream } from "@/lib/types";
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

  const { data: dream } = await supabase
    .from("dreams")
    .select("id, title, content, dreamed_at, emotion, created_at, updated_at, user_id, status")
    .eq("id", id)
    .maybeSingle<Dream>();

  if (!dream) notFound();

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-3xl text-foreground">
            {dreamTitle(dream)}
          </h1>
          <Link
            href={`/dreams/${dream.id}/edit`}
            className="shrink-0 text-sm text-faint hover:text-accent"
          >
            수정
          </Link>
        </div>
        <p className="text-sm text-faint">
          {formatDreamedAt(dream.dreamed_at)}
          {dream.emotion && ` · ${EMOTION_LABELS[dream.emotion]}`}
        </p>
      </header>

      <div className="whitespace-pre-wrap text-lg leading-relaxed text-muted">
        {dream.content}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-line pt-5">
        <Link href="/dreams" className="text-sm text-faint hover:text-accent">
          ← 목록
        </Link>
        <form action={deleteDream.bind(null, dream.id)}>
          <button className="text-sm text-faint transition hover:text-rose-300">
            삭제
          </button>
        </form>
      </footer>
    </article>
  );
}
