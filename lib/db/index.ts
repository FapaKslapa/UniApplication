import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

const d1Placeholder = {
  prepare: (_sql: string) => ({
    bind: (..._params: unknown[]) => ({
      all: async () => ({ results: [] }),
      run: async () => ({ success: true }),
      first: async () => null,
      raw: async () => [] as unknown[][],
    }),
  }),
  batch: async () => [],
  exec: async () => ({ success: true, count: 0 }),
} as Parameters<typeof drizzle>[0];

const d1 = (process.env as Record<string, unknown>).DB || d1Placeholder;

export const db = drizzle(d1, { schema });
