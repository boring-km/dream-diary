"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EMOTIONS, type DreamEmotion } from "@/lib/types";

// 폼에서 꿈 필드 추출. 본문만 필수, 나머지는 선택.
function parseDreamForm(formData: FormData) {
  const content = (formData.get("content") as string)?.trim();
  const titleRaw = (formData.get("title") as string)?.trim();
  const dreamedAtRaw = (formData.get("dreamed_at") as string)?.trim();
  const emotionRaw = (formData.get("emotion") as string)?.trim();
  const sharedRaw = (formData.get("shared") as string)?.trim();

  const emotion =
    emotionRaw && EMOTIONS.includes(emotionRaw as DreamEmotion)
      ? (emotionRaw as DreamEmotion)
      : null;

  return {
    content,
    title: titleRaw || null,
    dreamed_at: dreamedAtRaw || null, // 비면 DB default(오늘)
    emotion,
    status: sharedRaw === "on" ? "public" : "private", // 기본 나만 보기
  };
}

export async function createDream(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = parseDreamForm(formData);
  if (!fields.content) {
    throw new Error("본문을 입력해 주세요.");
  }

  const { error } = await supabase.from("dreams").insert({
    user_id: user.id,
    content: fields.content,
    title: fields.title,
    emotion: fields.emotion,
    status: fields.status,
    ...(fields.dreamed_at ? { dreamed_at: fields.dreamed_at } : {}),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dreams");
  redirect("/dreams");
}

export async function updateDream(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = parseDreamForm(formData);
  if (!fields.content) {
    throw new Error("본문을 입력해 주세요.");
  }

  const { error } = await supabase
    .from("dreams")
    .update({
      content: fields.content,
      title: fields.title,
      emotion: fields.emotion,
      status: fields.status,
      ...(fields.dreamed_at ? { dreamed_at: fields.dreamed_at } : {}),
    })
    .eq("id", id); // RLS가 본인 소유 보장

  if (error) throw new Error(error.message);

  revalidatePath("/dreams");
  revalidatePath(`/dreams/${id}`);
  redirect(`/dreams/${id}`);
}

export async function deleteDream(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("dreams").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dreams");
  redirect("/dreams");
}
