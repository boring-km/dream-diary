import "server-only";
import { createClient } from "@/lib/supabase/server";
import { iconForDream, type IconKey } from "@/lib/icons";
import { emotionToDrawer, type DrawerKey } from "@/lib/drawers";
import type { Dream } from "@/lib/types";

// 카드 = 꿈 + 파생값(고유번호·서랍·도장).
export type Card = Dream & {
  no: number; // 유저별 1부터, created_at asc 순번
  drawer: DrawerKey;
  icon: IconKey;
};

const SELECT =
  "id, title, content, dreamed_at, emotion, created_at, updated_at, user_id, status";

// 유저의 모든 꿈을 한 번에 가져와 번호·서랍·도장을 입힘.
// 개인 아카이브 규모 → 전체 로드가 단순·정확(번호 일관). 큰 규모면 P2에서 dream_no 컬럼화.
export async function fetchCards(): Promise<Card[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dreams")
    .select(SELECT)
    .order("created_at", { ascending: true })
    .returns<Dream[]>();

  if (!data) return [];

  // created_at asc index+1 = 고유번호 (영구·불변 근사. 삭제 시 결번은 P2 dream_no로 보강)
  return data.map((d, i) => ({
    ...d,
    no: i + 1,
    drawer: emotionToDrawer(d.emotion),
    icon: iconForDream(d.id),
  }));
}

// "오늘의 발굴" — 날짜 시드로 하루 동안 고정된 랜덤 1장.
export function dailyPickIndex(count: number, daySeed: string): number {
  if (count <= 0) return -1;
  let h = 0;
  for (let i = 0; i < daySeed.length; i++) h = (h * 31 + daySeed.charCodeAt(i)) >>> 0;
  return h % count;
}
