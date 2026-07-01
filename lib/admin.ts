if (!process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD is not set");
}
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return verifyAdminPassword(decoded);
  } catch {
    return false;
  }
}

export function createAdminToken(password: string): string | null {
  if (verifyAdminPassword(password)) {
    return Buffer.from(password).toString("base64");
  }
  return null;
}
