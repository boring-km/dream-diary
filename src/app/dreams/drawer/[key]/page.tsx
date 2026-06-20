import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCards } from "@/lib/dream-data";
import { drawerByKey } from "@/lib/drawers";
import DrawerTray from "@/components/DrawerTray";

export default async function OpenDrawerPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const drawer = drawerByKey(key);
  if (!drawer) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cards = (await fetchCards()).filter((c) => c.drawer === drawer.key);

  return (
    <div className="view-in flex flex-1 flex-col">
      <header className="mb-2 flex items-baseline justify-between">
        <Link
          href="/dreams"
          className="flex items-center gap-1.5 text-[0.9rem] text-ink-soft transition hover:text-blue-deep"
        >
          ‹ 서랍장
        </Link>
        <span className="font-serif text-[0.82rem] text-ink-faint">
          {drawer.name}
        </span>
      </header>

      <DrawerTray
        cards={cards.map((c) => ({ id: c.id, no: c.no, icon: c.icon }))}
      />
    </div>
  );
}
