import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

function nodeHeadersToFetchHeaders(
  nodeHeaders: Record<string, string | string[] | undefined>,
): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }
  return headers;
}

export default createNextApiHandler({
  router: appRouter,
  createContext: ({ req }) =>
    createTRPCContext({ headers: nodeHeadersToFetchHeaders(req.headers) }),
});
