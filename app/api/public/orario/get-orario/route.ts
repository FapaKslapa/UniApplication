import { orarioRouter } from "@/server/api/routers/orario";
import { createTRPCContext } from "@/server/api/trpc";
import { getOrarioBodySchema, jsonResponse } from "../schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Richiesta non valida" }, 400);
  }

  const parsed = getOrarioBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Richiesta non valida" }, 400);
  }

  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const caller = orarioRouter.createCaller(ctx);
    const result = await caller.getOrario(parsed.data);
    return jsonResponse(result);
  } catch (err) {
    console.error("get-orario failed:", err);
    return jsonResponse({ error: "Errore interno" }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
