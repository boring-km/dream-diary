import type { IconKey } from "./icons";

// 자기보상 — 압박·경쟁 0. 조용히 쌓이는 수집의 뿌듯함만. (.impeccable.md 톤)
// 비-AI, 전부 클라이언트 파생. P2에서 알림/연출 확장.
export type Badge = { key: string; label: string; icon: IconKey };

type Input = { count: number; createdAts: string[] };

// 연속 기록일 — 오늘(또는 어제)부터 거꾸로 끊기지 않은 날 수.
function streak(createdAts: string[]): number {
  const days = new Set(createdAts.map((t) => t.slice(0, 10)));
  if (days.size === 0) return 0;
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  // 시작점: 오늘 기록 있으면 오늘, 없고 어제 있으면 어제, 둘 다 없으면 0.
  const t0 = iso(today);
  const y = new Date(today);
  y.setUTCDate(y.getUTCDate() - 1);
  let cursor: Date;
  if (days.has(t0)) cursor = today;
  else if (days.has(iso(y))) cursor = y;
  else return 0;

  let n = 0;
  while (days.has(iso(cursor))) {
    n++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return n;
}

export function earnedBadges({ count, createdAts }: Input): Badge[] {
  const s = streak(createdAts);
  const out: Badge[] = [];
  if (count >= 1) out.push({ key: "first", label: "첫 발굴", icon: "star" });
  if (count >= 10) out.push({ key: "ten", label: "수집가", icon: "key" });
  if (count >= 30) out.push({ key: "thirty", label: "서랍지기", icon: "door" });
  if (s >= 3) out.push({ key: "streak3", label: `꾸준히 ${s}일`, icon: "sun" });
  return out;
}
