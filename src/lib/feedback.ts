import type { DreamEmotion } from "./types";

// 꿈을 적고 나면 받는 담백한 한 문장.
// 압박·평가·해석 아님 — 그저 잘 붙잡았다는 조용한 인사. (.impeccable.md 톤)
//
// 지금: 감정별 템플릿(비-AI, 비용 0, P1.5 범위).
// P2: 실제 Claude(감정 렌즈)로 교체 — 아래 FEEDBACK_PROMPT 사용. 서버 API Route에서만 호출.

const BY_EMOTION: Record<DreamEmotion, string[]> = {
  happy: ["좋은 장면 하나, 잘 붙잡았어요.", "깨고도 남은 기쁨이네요."],
  peaceful: ["고요한 한 장면을 종이에 옮겼어요.", "차분한 꿈이 한 장 쌓였어요."],
  funny: ["피식 웃게 되는 꿈이네요.", "이런 건 적어두길 잘했어요."],
  strange: ["이상한 건 이상한 대로 두어요.", "설명 안 돼도 괜찮은 꿈이에요."],
  sad: ["슬픈 꿈도 흘려보내지 않고 담았어요.", "괜찮아요, 적어두는 것만으로 충분해요."],
  fear: ["무서웠던 한 장면, 이제 서랍에 넣어두어요.", "꺼내 적었으니 조금은 가벼워져요."],
  anxious: ["불안한 꿈은 깊은 서랍에 묻어두어요.", "적고 나면 한 걸음 멀어져요."],
};

const NEUTRAL = [
  "한 장, 잘 붙잡았어요.",
  "흘려보낼 뻔한 꿈을 종이에 옮겼어요.",
  "조용히 한 장 쌓였어요.",
];

// 같은 꿈엔 항상 같은 문장 (id 기반). 새로고침해도 안 바뀜.
function pick(list: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

export function feedbackLine(emotion: DreamEmotion | null, seed: string): string {
  const list = emotion ? BY_EMOTION[emotion] : NEUTRAL;
  return pick(list, seed);
}

// --- P2 교체용 프롬프트 스캐폴드 (지금은 미사용) ---
export const FEEDBACK_PROMPT = `당신은 꿈 기록 아카이브의 조용한 목소리입니다.
사용자가 방금 적은 꿈에 대해 '담백한 한 문장'으로만 응답합니다.

규칙:
- 정확히 한 문장. 20자 내외. 마침표로 끝냅니다.
- 해몽/분석/조언 금지. 평가·점수·이모지 금지.
- 좋은 말 위주, 압박 0. 그저 잘 붙잡았다는 조용한 인사.
- 부정적 꿈이면 위로 한 스푼, 과장 없이.
- 한국어, 정돈된 인쇄체 톤.

꿈 본문에만 반응하고, 군더더기 없이 그 한 문장만 출력하세요.`;
