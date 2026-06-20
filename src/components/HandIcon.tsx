import { ICON_PATHS, type IconKey } from "@/lib/icons";

// 파란 손그림 도장. 단색 stroke, 채움 없음.
export default function HandIcon({
  name,
  size = 56,
  className,
}: {
  name: IconKey;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--blue)"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// 서랍 손잡이 — 살짝 휜 선.
export function DrawerPull({ className }: { className?: string }) {
  return (
    <svg
      width={40}
      height={12}
      viewBox="0 0 40 12"
      fill="none"
      stroke="var(--blue)"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M3 7 C8 2 32 2 37 7" />
    </svg>
  );
}
