const COOKIE_NAME = "uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;
const ID_PATTERN = /^[a-f0-9]{32}$/;

function readCookie(headers: Headers, name: string): string | null {
  const raw = headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }
  return null;
}

function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function serializeCookie(value: string): string {
  const attributes = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  return attributes.join("; ");
}

export function resolveIdentity(
  headers: Headers,
  resHeaders?: Headers,
): { userId: string; isNew: boolean } {
  const existing = readCookie(headers, COOKIE_NAME);
  if (existing && ID_PATTERN.test(existing)) {
    return { userId: existing, isNew: false };
  }
  const userId = generateId();
  resHeaders?.append("Set-Cookie", serializeCookie(userId));
  return { userId, isNew: true };
}
