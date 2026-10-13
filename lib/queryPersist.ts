import {
  type DehydratedState,
  dehydrate,
  hydrate,
  type Query,
  type QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

const STORAGE_KEY = "uniorario-query-cache-v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const WRITE_DELAY_MS = 2000;
const PERSISTED_ROUTERS = new Set(["orario"]);

type Stored = { savedAt: number; state: DehydratedState };

function shouldPersist(query: Query): boolean {
  if (query.state.status !== "success") return false;
  const head = query.queryKey[0];
  return Array.isArray(head) && PERSISTED_ROUTERS.has(String(head[0]));
}

function write(client: QueryClient) {
  try {
    const state = dehydrate(client, { shouldDehydrateQuery: shouldPersist });
    const payload: Stored = { savedAt: Date.now(), state };
    localStorage.setItem(STORAGE_KEY, superjson.stringify(payload));
  } catch {
    return;
  }
}

function restore(client: QueryClient) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const stored = superjson.parse<Stored>(raw);
    if (Date.now() - stored.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    hydrate(client, stored.state);
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }
}

export function persistQueryClient(client: QueryClient): () => void {
  restore(client);
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      write(client);
    }, WRITE_DELAY_MS);
  };
  const unsubscribe = client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "success") {
      schedule();
    }
  });
  return () => {
    unsubscribe();
    if (timer) clearTimeout(timer);
  };
}
