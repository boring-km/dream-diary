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
      className="rounded-full bg-accent px-6 py-2.5 font-medium text-[#0a0a18] transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "저장 중…" : label}
    </button>
  );
}

export default function DreamForm({
  action,
  dream,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => void | Promise<void>;
  dream?: Dream;
  submitLabel?: string;
}) {
  // 새벽 기록 마찰 최소화: 본문만 먼저, 나머지는 접어둠.
  const [showDetails, setShowDetails] = useState(
    Boolean(dream?.title || dream?.emotion),
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <textarea
        name="content"
        required
        autoFocus
        defaultValue={dream?.content ?? ""}
        placeholder="떠오르는 대로 적어요. 정리하지 않아도 괜찮아요."
        rows={10}
        className="w-full resize-y rounded-2xl border border-line bg-card p-5 text-lg leading-relaxed text-foreground outline-none backdrop-blur placeholder:text-faint focus:border-accent"
      />

      {!showDetails && (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="self-start text-sm text-faint underline-offset-4 hover:text-accent hover:underline"
        >
          + 제목·날짜·감정 더하기 (선택)
        </button>
      )}

      {showDetails && (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card/60 p-5 backdrop-blur">
          <label className="flex flex-col gap-1.5 text-sm text-faint">
            제목
            <input
              type="text"
              name="title"
              defaultValue={dream?.title ?? ""}
              placeholder="비우면 날짜로 표시돼요"
              className="rounded-lg border border-line bg-background/40 px-3 py-2 text-base text-foreground outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-faint">
            꿈 꾼 날
            <input
              type="date"
              name="dreamed_at"
              defaultValue={dream?.dreamed_at ?? ""}
              className="rounded-lg border border-line bg-background/40 px-3 py-2 text-base text-foreground outline-none focus:border-accent [color-scheme:dark]"
            />
          </label>

          <fieldset className="flex flex-col gap-2 text-sm text-faint">
            감정
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="emotion"
                  value=""
                  defaultChecked={!dream?.emotion}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-line px-3 py-1.5 text-foreground peer-checked:border-accent peer-checked:bg-accent/20">
                  없음
                </span>
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
                  <span className="inline-block rounded-full border border-line px-3 py-1.5 text-foreground peer-checked:border-accent peer-checked:bg-accent/20">
                    {EMOTION_LABELS[e]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      <div className="flex items-center gap-4">
        <SubmitButton label={submitLabel} />
        <Link href="/dreams" className="text-sm text-faint hover:text-accent">
          취소
        </Link>
      </div>
    </form>
  );
}
