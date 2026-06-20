// 손그림 파란 라인 아이콘 풀 — 카드의 "그날의 도장".
// 글자가 아니라 손그림이 유일한 장식 (.impeccable.md 원칙 2).
// 24x24 viewBox, stroke만. 색/굵기는 HandIcon에서 입힘.

export const ICON_PATHS = {
  horse:
    "M3 16 C4 11 8 9 12 10 C14 8 16 7 19 6 C18 8 20 9 21 8 C20 11 16 11 15 14 M6 13 L5 19 M10 13 L10 19 M14 13 L14 19 M11 10 C10 12 8 12 6 13",
  cloud: "M5 16 C2 16 2 12 5 12 C5 8 11 8 11 12 C15 10 18 13 16 16 Z",
  moon: "M17 13 A6.5 6.5 0 1 1 10 5.5 A5 5 0 0 0 17 13 Z",
  bird: "M3 13 C7 6 11 6 12 11 C13 6 17 6 21 13 M12 11 L12 18",
  fish: "M3 12 C7 7 14 7 17 12 C14 17 7 17 3 12 Z M17 12 L21 9 M17 12 L21 15",
  key: "M9.7 11 L18 19 M15 16 L17 14 M17 18 L19 16 M7.5 5.8 A3.2 3.2 0 1 0 7.5 12.2 A3.2 3.2 0 0 0 7.5 5.8",
  star: "M12 3 L14 9 L20 9.5 L15.5 13.5 L17 20 L12 16 L7 20 L8.5 13.5 L4 9.5 L10 9 Z",
  stairs: "M4 19 L4 15 L9 15 L9 11 L14 11 L14 7 L20 7",
  eye: "M3 12 C6 7 18 7 21 12 C18 17 6 17 3 12 Z M12 9.5 A2.5 2.5 0 1 0 12 14.5 A2.5 2.5 0 0 0 12 9.5",
  mountain: "M3 19 L9 8 L13 14 L16 9 L21 19 Z",
  sun: "M12 7.5 A4.5 4.5 0 1 0 12 16.5 A4.5 4.5 0 0 0 12 7.5 M12 2 L12 4 M12 20 L12 22 M4 12 L2 12 M22 12 L20 12 M5.5 5.5 L4 4 M18.5 5.5 L20 4 M5.5 18.5 L4 20 M18.5 18.5 L20 20",
  door: "M7 21 L7 4 L16 3 L16 21 Z M13.5 12 L13.5 13.5",
  hand: "M7 13 L7 9 C7 8 8.5 8 8.5 9 L8.5 12 M8.5 11 L8.5 7.5 C8.5 6.5 10 6.5 10 7.5 L10 12 M10 8 C10 7 11.5 7 11.5 8 L11.5 12 M11.5 9 C11.5 8 13 8 13 9 L13 13 C13 17 11 19 9 19 C7 19 6 17 5.5 15 L4.5 12.5 C4 11.5 5.5 10.8 6 11.8 L7 13.5",
  wave: "M3 10 C5 7 7 13 9 10 C11 7 13 13 15 10 C17 7 19 13 21 10 M3 15 C5 12 7 18 9 15 C11 12 13 18 15 15 C17 12 19 18 21 15",
} as const;

export type IconKey = keyof typeof ICON_PATHS;

export const ICON_KEYS = Object.keys(ICON_PATHS) as IconKey[];

// id 문자열 → 안정적 해시 (djb2). 같은 꿈은 항상 같은 도장.
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

// 꿈 id로 도장 결정 — 영구·불변. (P2: 감정/키워드 기반 AI 생성으로 확장)
export function iconForDream(id: string): IconKey {
  return ICON_KEYS[hash(id) % ICON_KEYS.length];
}
