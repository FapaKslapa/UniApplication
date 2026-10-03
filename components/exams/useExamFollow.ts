"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ExamDTO } from "@/lib/exams/dto";

type MutationError = { message: string; data?: unknown };

function messageFor(error: MutationError) {
  const code = (error.data as { code?: string } | null | undefined)?.code;
  if (code === "TOO_MANY_REQUESTS") {
    return "Troppe richieste, riprova tra poco.";
  }
  if (code === "BAD_REQUEST" && error.message) return error.message;
  return "Non è stato possibile aggiornare. Riprova.";
}

export function useExamFollow(examId: string, following: boolean) {
  const utils = api.useUtils();
  const [override, setOverride] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = (next: boolean) => ({
    onMutate: async () => {
      setError(null);
      setOverride(next);
      await utils.exams.followed.cancel();
      const previous = utils.exams.followed.getData();
      if (!next) {
        utils.exams.followed.setData(undefined, (data) =>
          data?.filter((item) => item.id !== examId),
        );
      }
      return { previous };
    },
    onError: (
      err: MutationError,
      _vars: unknown,
      context?: { previous?: ExamDTO[] },
    ) => {
      setError(messageFor(err));
      setOverride(null);
      if (context?.previous) {
        utils.exams.followed.setData(undefined, context.previous);
      }
    },
    onSettled: async () => {
      await Promise.all([
        utils.exams.search.invalidate(undefined, { refetchType: "all" }),
        utils.exams.followed.invalidate(undefined, { refetchType: "all" }),
        utils.exams.forAgenda.invalidate(),
      ]);
      setOverride(null);
    },
  });

  const follow = api.exams.follow.useMutation(options(true));
  const unfollow = api.exams.unfollow.useMutation(options(false));
  const current = override ?? following;

  const toggle = () => {
    if (current) unfollow.mutate({ examId });
    else follow.mutate({ examId });
  };

  return {
    following: current,
    toggle,
    pending: follow.isPending || unfollow.isPending,
    error,
  };
}
