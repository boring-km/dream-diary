import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dreams");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto mb-9 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_38%_35%,#fff8e6,#f0e4c0_45%,#cdbf94_75%,#b3a47e)] shadow-[0_0_60px_14px_rgba(243,236,216,0.35)]" />
      <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
        자다 깬 꿈을,
        <br />
        흘려보내지 않도록
      </h1>
      <p className="mt-6 max-w-md font-serif text-lg text-muted">
        새벽에 꾼 꿈은 눈 뜨면 사라진다. 빠르게 붙잡아 보관하는 한국어 꿈
        아카이브.
      </p>
      <Link
        href="/login"
        className="mt-10 rounded-full bg-accent px-8 py-3 font-medium text-[#0a0a18] transition hover:opacity-90"
      >
        시작하기
      </Link>
    </main>
  );
}
