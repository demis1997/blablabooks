import type { BookSearchResult } from "@/types/database";
import {
  enrichWithPageCount,
  searchOpenLibrary,
} from "./open-library";
import {
  getGoogleBooksPageCount,
  searchGoogleBooks,
} from "./google-books";

export type SearchBooksOptions = {
  page?: number;
  limit?: number;
  author?: string;
  /** When true (default), fill missing page counts via OL edition + Google. */
  enrichPageCount?: boolean;
  /** When true, also query Google Books and merge unique results. */
  includeGoogleFallback?: boolean;
};

/**
 * Trim and enforce the minimum query length used by searchBooks.
 * Returns null when the query should not hit remote APIs.
 */
export function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length < 2) return null;
  return trimmed;
}

function resultIdentity(result: BookSearchResult): string {
  if (result.isbn13) return `isbn13:${result.isbn13}`;
  if (result.isbn10) return `isbn10:${result.isbn10}`;
  if (result.openLibraryWorkKey) return `ol:${result.openLibraryWorkKey}`;
  if (result.googleBooksId) return `gb:${result.googleBooksId}`;
  return `ta:${result.title.toLowerCase()}|${result.authors.join(",").toLowerCase()}`;
}

/**
 * Server-side book search. Open Library is primary; Google is optional fallback.
 * Debouncing belongs on the client — this function runs the actual query.
 */
export async function searchBooks(
  query: string,
  options: SearchBooksOptions = {},
): Promise<{ results: BookSearchResult[]; total: number }> {
  const trimmed = validateSearchQuery(query);
  if (!trimmed) {
    return { results: [], total: 0 };
  }

  const {
    page = 1,
    limit = 10,
    author,
    enrichPageCount = true,
    includeGoogleFallback = true,
  } = options;

  const { results: openLibraryResults, total } = await searchOpenLibrary(
    trimmed,
    { page, limit, author },
  );

  let results = openLibraryResults;

  if (enrichPageCount) {
    results = await Promise.all(
      results.map(async (result) => {
        let next = await enrichWithPageCount(result);
        if ((!next.pageCount || next.pageCount <= 0) && includeGoogleFallback) {
          const pageCount = await getGoogleBooksPageCount(
            next.isbn13 || next.isbn10
              ? { isbn: (next.isbn13 || next.isbn10)! }
              : {
                  title: next.title,
                  author: next.authors[0],
                },
          );
          if (pageCount) {
            next = { ...next, pageCount };
          }
        }
        return next;
      }),
    );
  }

  if (includeGoogleFallback && results.length < limit) {
    try {
      const googleResults = await searchGoogleBooks(
        author ? `${trimmed} ${author}` : trimmed,
      );
      const seen = new Set(results.map(resultIdentity));
      for (const google of googleResults) {
        const id = resultIdentity(google);
        if (seen.has(id)) continue;
        seen.add(id);
        results.push(google);
        if (results.length >= limit) break;
      }
    } catch {
      // Google is best-effort fallback
    }
  }

  return { results: results.slice(0, limit), total };
}
