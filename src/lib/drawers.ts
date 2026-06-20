import type { DreamEmotion } from "./types";

// 4개 감정 서랍 — 위=자주 꺼냄 / 아래=묻어둠 (design-concept §7).
// 위치 = 깊이 = 비밀도. 고정 개수.
export type DrawerKey = "good" | "odd" | "sad" | "mare";

export type DrawerDef = {
  key: DrawerKey;
  name: string;
  emotions: DreamEmotion[];
  deep?: boolean; // 깊이 묻어둠 (흐릿하게)
  note?: string; // 성격 한 줄
};

export const DRAWERS: DrawerDef[] = [
  { key: "good", name: "좋은 꿈", emotions: ["happy", "peaceful", "funny"], note: "자주 꺼내봄" },
  { key: "odd", name: "이상한 꿈", emotions: ["strange"] },
  { key: "sad", name: "슬픈 꿈", emotions: ["sad"] },
  { key: "mare", name: "악몽", emotions: ["fear", "anxious"], deep: true, note: "깊이 묻어둠" },
];

const DEFAULT_DRAWER: DrawerKey = "odd"; // 감정 미선택 → 이상한 꿈

const EMOTION_TO_DRAWER = new Map<DreamEmotion, DrawerKey>(
  DRAWERS.flatMap((d) => d.emotions.map((e) => [e, d.key] as const)),
);

export function emotionToDrawer(emotion: DreamEmotion | null): DrawerKey {
  if (!emotion) return DEFAULT_DRAWER;
  return EMOTION_TO_DRAWER.get(emotion) ?? DEFAULT_DRAWER;
}

export function drawerByKey(key: string): DrawerDef | undefined {
  return DRAWERS.find((d) => d.key === key);
}
