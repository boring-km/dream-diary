import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HandIcon from "@/components/HandIcon";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dreams");

  return (
    <main className="view-in mx-auto flex min-h-dvh max-w-[480px] flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 grid h-20 w-20 place-items-center rounded-2xl border border-line bg-card">
        <HandIcon name="moon" size={44} />
      </div>
      <h1 className="font-serif text-[2rem] font-bold leading-[1.5] tracking-tight text-ink">
        흘려보낼 뻔한 꿈을,
        <br />
        한 장씩 모아요
      </h1>
      <p className="mt-5 max-w-sm font-serif text-[0.98rem] leading-relaxed text-ink-soft">
        꿈을 적으면 손그림 카드 한 장. 서랍에 쌓아 두고, 나중에 흩어진 더미에서
        잊은 꿈을 발굴해요.
      </p>
      <Link
        href="/login"
        className="mt-9 rounded-full bg-blue px-8 py-3 text-sm font-medium text-paper transition hover:bg-blue-deep"
      >
        시작하기
      </Link>
    </main>
  );
}
