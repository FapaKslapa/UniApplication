import { ExamsScreen } from "@/components/exams/ExamsScreen";

export function ExamsLayout() {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col md:max-w-md xl:max-w-none">
      <ExamsScreen />
    </div>
  );
}
