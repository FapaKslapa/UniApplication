import { orarioRouter } from "@/server/api/routers/orario";
import { createTRPCContext } from "@/server/api/trpc";
import { jsonResponse, nextLessonQuerySchema } from "../schemas";

const MAX_CACHE_ENTRIES = 200;
const cache = new Map<string, { data: unknown; expires: number }>();

function getCacheDuration(dayOffset: number): number {
  if (dayOffset < 0) return 0;
  if (dayOffset === 0) return 30 * 60 * 1000;
  return 4 * 60 * 60 * 1000;
}

function getCacheKey(dayOffset: number, linkId?: string): string {
  return `nextLesson_${dayOffset}_${linkId || "default"}`;
}

function storeInCache(key: string, data: unknown, expires: number) {
  cache.delete(key);
  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  cache.set(key, { data, expires });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = nextLessonQuerySchema.safeParse({
    dayOffset: url.searchParams.get("dayOffset") ?? undefined,
    linkId: url.searchParams.get("linkId") || undefined,
  });
  if (!parsed.success) {
    return jsonResponse({ error: "Richiesta non valida" }, 400);
  }
  const { dayOffset, linkId } = parsed.data;

  try {
    const cacheKey = getCacheKey(dayOffset, linkId);
    const cacheDuration = getCacheDuration(dayOffset);
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cacheDuration > 0 && cached && cached.expires > now) {
      return jsonResponse(cached.data);
    }

    const ctx = await createTRPCContext({ headers: req.headers });
    const caller = orarioRouter.createCaller(ctx);
    const result = await caller.getNextLesson({ dayOffset, linkId });

    if (cacheDuration > 0) {
      storeInCache(cacheKey, result, now + cacheDuration);
    }

    return jsonResponse(result);
  } catch (err) {
    console.error("next-lesson failed:", err);
    return jsonResponse({ error: "Errore interno" }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
