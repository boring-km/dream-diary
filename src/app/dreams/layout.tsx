import Link from "next/link";

export default function DreamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between border-b border-line py-5">
        <Link href="/dreams" className="font-serif text-xl text-foreground">
          꿈 아카이브
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/dreams/new"
            className="rounded-full bg-accent px-4 py-2 font-medium text-[#0a0a18] transition hover:opacity-90"
          >
            + 기록
          </Link>
          <form action="/auth/signout" method="post">
            <button className="text-faint transition hover:text-accent">
              로그아웃
            </button>
          </form>
        </nav>
      </header>
      <main className="flex flex-1 flex-col py-8">{children}</main>
    </div>
  );
}
