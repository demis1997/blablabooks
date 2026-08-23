import type { Book } from "@/types/database";
import { buildNormalizedKey, normalizeAuthors, normalizeTitle } from "./normalize";

export type DuplicateCandidate = Partial<
  Pick<
    Book,
    | "isbn_13"
    | "isbn_10"
    | "open_library_work_key"
    | "google_books_id"
    | "title"
    | "authors"
    | "normalized_title"
    | "normalized_authors"
  >
>;

function nonEmpty(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function candidateNormalizedKey(candidate: DuplicateCandidate): string | null {
  if (
    nonEmpty(candidate.normalized_title) &&
    candidate.normalized_authors !== undefined
  ) {
    return `${candidate.normalized_title}::${candidate.normalized_authors}`;
  }

  if (nonEmpty(candidate.title) && Array.isArray(candidate.authors)) {
    return buildNormalizedKey(candidate.title, candidate.authors);
  }

  if (nonEmpty(candidate.title)) {
    return buildNormalizedKey(candidate.title, []);
  }

  return null;
}

/**
 * Find existing books that match the candidate by ISBN, external IDs,
 * or normalized title + authors.
 */
export function findDuplicateMatches(
  existing: Book[],
  candidate: DuplicateCandidate,
): Book[] {
  const isbn13 = candidate.isbn_13?.trim() || null;
  const isbn10 = candidate.isbn_10?.trim() || null;
  const workKey = candidate.open_library_work_key?.trim() || null;
  const googleId = candidate.google_books_id?.trim() || null;
  const normalizedKey = candidateNormalizedKey(candidate);

  const matches = existing.filter((book) => {
    if (isbn13 && book.isbn_13 && book.isbn_13 === isbn13) return true;
    if (isbn10 && book.isbn_10 && book.isbn_10 === isbn10) return true;
    if (
      workKey &&
      book.open_library_work_key &&
      book.open_library_work_key === workKey
    ) {
      return true;
    }
    if (
      googleId &&
      book.google_books_id &&
      book.google_books_id === googleId
    ) {
      return true;
    }

    if (normalizedKey) {
      const bookKey =
        book.normalized_title && book.normalized_authors !== undefined
          ? `${book.normalized_title}::${book.normalized_authors}`
          : buildNormalizedKey(book.title, book.authors);
      if (bookKey === normalizedKey) return true;
    }

    return false;
  });

  // Stable uniqueness by id
  const seen = new Set<string>();
  return matches.filter((book) => {
    if (seen.has(book.id)) return false;
    seen.add(book.id);
    return true;
  });
}

/** Convenience helper when only raw title/authors are available. */
export function findDuplicatesByTitleAuthor(
  existing: Book[],
  title: string,
  authors: string[],
): Book[] {
  return findDuplicateMatches(existing, {
    title,
    authors,
    normalized_title: normalizeTitle(title),
    normalized_authors: normalizeAuthors(authors),
  });
}
