import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 본인 꿈 전부 JSON 다운로드 (무료 내보내기).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:3000"),
    );
  }

  const { data: dreams, error } = await supabase
    .from("dreams")
    .select("title, content, dreamed_at, emotion, created_at, updated_at")
    .order("dreamed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const body = JSON.stringify(
    { exported_at: new Date().toISOString(), count: dreams?.length ?? 0, dreams },
    null,
    2,
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dream-archive-export.json"`,
    },
  });
}
