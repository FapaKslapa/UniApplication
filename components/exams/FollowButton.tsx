"use client";

import { Check } from "lucide-react";
import { useExamFollow } from "@/components/exams/useExamFollow";
import { Button } from "@/components/ui/button";

type FollowButtonProps = {
  examId: string;
  subject: string;
  following: boolean;
};

export function FollowButton({
  examId,
  subject,
  following,
}: FollowButtonProps) {
  const state = useExamFollow(examId, following);

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button
        type="button"
        variant={state.following ? "secondary" : "outline"}
        aria-pressed={state.following}
        aria-label={
          state.following ? `Smetti di seguire ${subject}` : `Segui ${subject}`
        }
        onClick={state.toggle}
        className="min-h-11 rounded-full px-4 text-xs font-semibold"
      >
        {state.following && <Check className="size-3.5" aria-hidden />}
        {state.following ? "Seguito" : "Segui"}
      </Button>
      {state.error && (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      )}
    </div>
  );
}
