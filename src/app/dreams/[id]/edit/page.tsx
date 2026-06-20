import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DreamForm from "@/components/DreamForm";
import { updateDream } from "../../actions";
import type { Dream } from "@/lib/types";

export default async function EditDreamPage({
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
    <div className="view-in flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="font-serif text-xl text-ink">꿈 다듬기</h1>
        <Link
          href={`/dreams/${dream.id}`}
          className="text-[0.85rem] text-ink-faint transition hover:text-blue-deep"
        >
          ‹ 돌아가기
        </Link>
      </header>
      <DreamForm
        action={updateDream.bind(null, dream.id)}
        dream={dream}
        submitLabel="저장"
      />
    </div>
  );
}
