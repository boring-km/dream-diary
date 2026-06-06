import { createDream } from "../actions";
import DreamForm from "@/components/DreamForm";

export default function NewDreamPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-foreground">새 꿈</h1>
      <DreamForm action={createDream} submitLabel="기록하기" />
    </div>
  );
}
