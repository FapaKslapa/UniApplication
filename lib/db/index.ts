import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Build-time placeholder to prevent crashes when process.env.DB is not defined during static analysis
const d1Placeholder = {
  prepare: () => ({
    bind: () => ({
      all: async () => ({ results: [] }),
      run: async () => ({ success: true }),
      first: async () => null,
    }),
  }),
  batch: async () => [],
  exec: async () => ({ success: true }),
} as any;

const d1 = process.env.DB || d1Placeholder;

export const db = drizzle(d1, { schema });
