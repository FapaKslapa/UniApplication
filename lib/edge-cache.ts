function getDefaultCache(): Cache | undefined {
  return typeof caches !== "undefined"
    ? (caches as unknown as { default: Cache }).default
    : undefined;
}

export async function withEdgeCache<T>(
  cacheKeyUrl: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const cache = getDefaultCache();
  const cacheKey = cache ? new Request(cacheKeyUrl) : undefined;

  if (cache && cacheKey) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      try {
        return (await cached.json()) as T;
      } catch {}
    }
  }

  const result = await compute();
  await setEdgeCache(cacheKeyUrl, ttlSeconds, result);
  return result;
}

export async function setEdgeCache<T>(
  cacheKeyUrl: string,
  ttlSeconds: number,
  value: T,
): Promise<void> {
  const cache = getDefaultCache();
  if (!cache) return;
  await cache.put(
    new Request(cacheKeyUrl),
    new Response(JSON.stringify(value), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `max-age=${ttlSeconds}`,
      },
    }),
  );
}
