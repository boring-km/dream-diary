import Link from "next/link";
import { createDream } from "../actions";
import DreamForm from "@/components/DreamForm";

export default function NewDreamPage() {
  return (
    <div className="view-in flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="font-serif text-xl text-ink">오늘의 꿈</h1>
        <Link
          href="/dreams"
          className="text-[0.85rem] text-ink-faint transition hover:text-blue-deep"
        >
          ‹ 서랍장
        </Link>
      </header>
      <DreamForm action={createDream} submitLabel="발행하기" />
    </div>
  );
}
