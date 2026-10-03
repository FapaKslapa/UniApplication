import { setEdgeCache } from "@/lib/edge-cache";
import { computeAllProfessors, PROFESSORS_CACHE_URL } from "@/lib/professors";

const WINDOW_DAYS = 150;
const CACHE_TTL_SECONDS = 8 * 60 * 60;

export async function refreshProfessors() {
  const names = await computeAllProfessors(WINDOW_DAYS);
  await setEdgeCache(PROFESSORS_CACHE_URL, CACHE_TTL_SECONDS, names);
  return { professors: names.length };
}
