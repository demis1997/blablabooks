import type { Book } from "@/types/database";

/**
 * Cryptographically secure random index in [0, length).
 * Works in Node and Edge runtimes via Web Crypto.
 */
export function secureRandomIndex(length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("secureRandomIndex requires a positive integer length");
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error("Web Crypto getRandomValues is unavailable in this runtime");
  }

  // Rejection sampling avoids modulo bias for large ranges.
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % length);
  const buffer = new Uint32Array(1);

  for (;;) {
    cryptoApi.getRandomValues(buffer);
    const value = buffer[0]!;
    if (value < limit) {
      return value % length;
    }
  }
}

export function pickRandomBookId(eligibleIds: string[]): string | null {
  if (eligibleIds.length === 0) return null;
  return eligibleIds[secureRandomIndex(eligibleIds.length)] ?? null;
}

/**
 * Eligible draw pool: candidate status, not archived, not in excluded set.
 */
export function filterEligibleCandidates(
  books: Book[],
  excludedIds: string[],
): Book[] {
  const excluded = new Set(excludedIds);
  return books.filter(
    (book) =>
      book.status === "candidate" &&
      !book.is_archived &&
      !excluded.has(book.id),
  );
}
