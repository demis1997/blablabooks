/**
 * Lowercase, trim, collapse whitespace, and strip punctuation for comparison.
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize authors the same way as titles, joined with a stable separator.
 */
export function normalizeAuthors(authors: string[]): string {
  return authors
    .map((author) => normalizeTitle(author))
    .filter(Boolean)
    .sort()
    .join(" | ");
}

export function buildNormalizedKey(title: string, authors: string[]): string {
  return `${normalizeTitle(title)}::${normalizeAuthors(authors)}`;
}
