import { createHash } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const memory = new Map<string, number[]>();

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function isRateLimited(ipHash: string, now = Date.now()): boolean {
  const stamps = (memory.get(ipHash) ?? []).filter((t) => now - t < WINDOW_MS);
  memory.set(ipHash, stamps);
  return stamps.length >= MAX_ATTEMPTS;
}

export function recordAttempt(ipHash: string, now = Date.now()): void {
  const stamps = (memory.get(ipHash) ?? []).filter((t) => now - t < WINDOW_MS);
  stamps.push(now);
  memory.set(ipHash, stamps);
}

export function clearAttempts(ipHash: string): void {
  memory.delete(ipHash);
}

export const GENERIC_LOGIN_ERROR =
  "Could not sign in. Check your details and try again.";

export const GENERIC_RESET_NOTICE =
  "If that email is registered as an administrator, we’ve sent reset instructions.";
