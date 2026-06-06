export type DreamEmotion =
  | "fear"
  | "funny"
  | "sad"
  | "strange"
  | "peaceful"
  | "anxious"
  | "happy";

export const EMOTION_LABELS: Record<DreamEmotion, string> = {
  fear: "무서움",
  funny: "웃김",
  sad: "슬픔",
  strange: "이상함",
  peaceful: "평온",
  anxious: "불안",
  happy: "기쁨",
};

export const EMOTIONS = Object.keys(EMOTION_LABELS) as DreamEmotion[];

export type Dream = {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  dreamed_at: string; // YYYY-MM-DD
  emotion: DreamEmotion | null;
  status: "draft" | "private" | "public";
  created_at: string;
  updated_at: string;
};
