import { createHash, randomBytes } from "node:crypto";

export function createOAuthState(adminId: string, secret: string): string {
  const nonce = randomBytes(24).toString("hex");
  const payload = `${adminId}.${nonce}`;
  const sig = createHash("sha256")
    .update(`${payload}.${secret}`)
    .digest("hex")
    .slice(0, 24);
  return `${payload}.${sig}`;
}

export function verifyOAuthState(
  state: string,
  expected: string,
  adminId: string,
): boolean {
  if (!state || !expected || state !== expected) return false;
  const [id] = state.split(".");
  return id === adminId;
}
