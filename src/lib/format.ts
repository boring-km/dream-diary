import type { Dream } from "./types";

// YYYY-MM-DD → "2026년 6월 7일"
export function formatDreamedAt(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

// 제목 없으면 꿈 꾼 날짜로 대체.
export function dreamTitle(dream: Pick<Dream, "title" | "dreamed_at">): string {
  return dream.title?.trim() || formatDreamedAt(dream.dreamed_at);
}
