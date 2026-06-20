"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { EMOTION_LABELS, EMOTIONS, type Dream } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-blue px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-blue-deep disabled:opacity-50"
    >
      {pending ? "발행 중…" : label}
    </button>
  );
}

const chip =
  "inline-block rounded-full border border-line px-3 py-1.5 text-ink-soft peer-checked:border-blue peer-checked:bg-blue/10 peer-checked:text-blue-deep";

export default function DreamForm({
  action,
  dream,
  submitLabel = "발행",
}: {
  action: (formData: FormData) => void | Promise<void>;
  dream?: Dream;
  submitLabel?: string;
}) {
  // 새벽 기록 마찰 최소화: 본문만 먼저, 나머지는 접어둠.
  const [showDetails, setShowDetails] = useState(
    Boolean(dream?.title || dream?.emotion || dream?.status === "public"),
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <textarea
        name="content"
        required
        autoFocus
        defaultValue={dream?.content ?? ""}
        placeholder="떠오르는 대로 적어요. 정리하지 않아도 괜찮아요."
        rows={9}
        className="w-full resize-y rounded-[10px] border border-line bg-card p-5 font-serif text-[1.1rem] leading-relaxed text-ink outline-none placeholder:font-sans placeholder:text-ink-faint focus:border-blue"
      />

      {!showDetails && (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="self-start text-sm text-ink-faint underline-offset-4 transition hover:text-blue-deep hover:underline"
        >
          + 제목·날짜·감정·공유 (선택)
        </button>
      )}

      {showDetails && (
        <div className="flex flex-col gap-4 rounded-[10px] border border-line bg-card p-5">
          <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
            제목
            <input
              type="text"
              name="title"
              defaultValue={dream?.title ?? ""}
              placeholder="비우면 날짜로 표시돼요"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-base text-ink outline-none focus:border-blue"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
            꿈 꾼 날
            <input
              type="date"
              name="dreamed_at"
              defaultValue={dream?.dreamed_at ?? ""}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-base text-ink outline-none focus:border-blue"
            />
          </label>

          <fieldset className="flex flex-col gap-2 text-sm text-ink-faint">
            감정 — 어느 서랍에 들어갈까요
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="emotion"
                  value=""
                  defaultChecked={!dream?.emotion}
                  className="peer sr-only"
                />
                <span className={chip}>없음</span>
              </label>
              {EMOTIONS.map((e) => (
                <label key={e} className="cursor-pointer">
                  <input
                    type="radio"
                    name="emotion"
                    value={e}
                    defaultChecked={dream?.emotion === e}
                    className="peer sr-only"
                  />
                  <span className={chip}>{EMOTION_LABELS[e]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center justify-between gap-3 border-t border-line pt-4 text-sm text-ink-soft">
            <span className="flex flex-col">
              전시관에 공개
              <span className="text-[0.78rem] text-ink-faint">
                끄면 나만 봅니다 (기본)
              </span>
            </span>
            <input
              type="checkbox"
              name="shared"
              defaultChecked={dream?.status === "public"}
              className="h-5 w-5 shrink-0 accent-[var(--blue)]"
            />
          </label>
        </div>
      )}

      <div className="flex items-center gap-4">
        <SubmitButton label={submitLabel} />
        <Link
          href="/dreams"
          className="text-sm text-ink-faint transition hover:text-blue-deep"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
