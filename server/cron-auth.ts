async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function isAuthorized(provided: string | null, secret: string) {
  const [a, b] = await Promise.all([digest(provided ?? ""), digest(secret)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0 && provided !== null;
}

export async function isCronRequestAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  return (
    !!secret && (await isAuthorized(req.headers.get("x-cron-secret"), secret))
  );
}
