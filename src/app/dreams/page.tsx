import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dreamTitle, formatDreamedAt } from "@/lib/format";
import { EMOTION_LABELS, type Dream } from "@/lib/types";

export default async function DreamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dreams } = await supabase
    .from("dreams")
    .select("id, title, content, dreamed_at, emotion, created_at, updated_at, user_id, status")
    .order("dreamed_at", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<Dream[]>();

  if (!dreams || dreams.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-serif text-xl text-muted">아직 기록된 꿈이 없어요.</p>
        <p className="mt-2 text-faint">깬 직후가 골든타임이에요.</p>
        <Link
          href="/dreams/new"
          className="mt-6 rounded-full bg-accent px-6 py-2.5 font-medium text-[#0a0a18] transition hover:opacity-90"
        >
          첫 꿈 적기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">기록</h1>
        <Link href="/dreams/export" className="text-sm text-faint hover:text-accent">
          내보내기
        </Link>
      </div>

      <ol className="flex flex-col gap-3">
        {dreams.map((dream) => (
          <li key={dream.id}>
            <Link
              href={`/dreams/${dream.id}`}
              className="block rounded-2xl border border-line bg-card p-5 backdrop-blur transition hover:border-accent"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-lg text-foreground">
                  {dreamTitle(dream)}
                </h2>
                <span className="shrink-0 text-xs text-faint">
                  {formatDreamedAt(dream.dreamed_at)}
                  {dream.emotion && ` · ${EMOTION_LABELS[dream.emotion]}`}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-muted">{dream.content}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
