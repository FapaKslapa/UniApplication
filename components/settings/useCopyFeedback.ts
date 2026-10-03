"use client";

import { useState } from "react";

const FEEDBACK_DURATION_MS = 2000;

export function useCopyFeedback() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), FEEDBACK_DURATION_MS);
    } catch {
      setCopiedKey(null);
    }
  };

  return { copiedKey, copy, reset: () => setCopiedKey(null) };
}
