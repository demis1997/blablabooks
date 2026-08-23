import type { BookSearchResult } from "@/types/database";

const OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_BASE = "https://openlibrary.org";

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  subtitle?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  language?: string[];
  subject?: string[];
  edition_key?: string[];
  number_of_pages_median?: number;
};

type OpenLibrarySearchResponse = {
  numFound?: number;
  docs?: OpenLibraryDoc[];
};

type OpenLibraryWork = {
  title?: string;
  description?: string | { value?: string };
  subjects?: string[];
  covers?: number[];
  first_publish_date?: string;
};

type OpenLibraryEdition = {
  title?: string;
  number_of_pages?: number;
  isbn_10?: string[];
  isbn_13?: string[];
  covers?: number[];
  languages?: Array<{ key?: string }>;
  publish_date?: string;
  works?: Array<{ key?: string }>;
};

function coverUrlFromId(coverId: number | undefined): string | undefined {
  if (coverId == null) return undefined;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function pickIsbn(
  isbns: string[] | undefined,
): { isbn10?: string; isbn13?: string } {
  if (!isbns?.length) return {};
  let isbn10: string | undefined;
  let isbn13: string | undefined;
  for (const raw of isbns) {
    const isbn = raw.replace(/[^0-9Xx]/g, "");
    if (!isbn10 && isbn.length === 10) isbn10 = isbn.toUpperCase();
    if (!isbn13 && isbn.length === 13) isbn13 = isbn;
  }
  return { isbn10, isbn13 };
}

function normalizeWorkKey(workKey: string): string {
  if (workKey.startsWith("/works/")) return workKey;
  if (workKey.startsWith("OL") && workKey.endsWith("W")) {
    return `/works/${workKey}`;
  }
  return workKey.startsWith("/") ? workKey : `/works/${workKey}`;
}

function normalizeEditionKey(editionKey: string): string {
  if (editionKey.startsWith("/books/")) return editionKey;
  if (editionKey.startsWith("OL") && editionKey.endsWith("M")) {
    return `/books/${editionKey}`;
  }
  return editionKey.startsWith("/") ? editionKey : `/books/${editionKey}`;
}

function mapDocToResult(doc: OpenLibraryDoc): BookSearchResult {
  const { isbn10, isbn13 } = pickIsbn(doc.isbn);
  return {
    title: doc.title?.trim() || "Untitled",
    subtitle: doc.subtitle?.trim() || undefined,
    authors: doc.author_name ?? [],
    firstPublishYear: doc.first_publish_year,
    pageCount: doc.number_of_pages_median,
    language: doc.language?.[0],
    isbn10,
    isbn13,
    subjects: doc.subject?.slice(0, 12),
    coverUrl: coverUrlFromId(doc.cover_i),
    openLibraryWorkKey: doc.key,
    openLibraryEditionKey: doc.edition_key?.[0]
      ? `/books/${doc.edition_key[0]}`
      : undefined,
    provider: "open_library",
  };
}

export async function searchOpenLibrary(
  query: string,
  options: { page?: number; limit?: number; author?: string } = {},
): Promise<{ results: BookSearchResult[]; total: number }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { results: [], total: 0 };
  }

  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(40, Math.max(1, options.limit ?? 10));

  const params = new URLSearchParams({
    q: trimmed,
    page: String(page),
    limit: String(limit),
    fields:
      "key,title,subtitle,author_name,first_publish_year,cover_i,isbn,language,subject,edition_key,number_of_pages_median",
  });

  if (options.author?.trim()) {
    params.set("author", options.author.trim());
  }

  const response = await fetch(`${OPEN_LIBRARY_SEARCH}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `Open Library search failed (${response.status} ${response.statusText})`,
    );
  }

  const data = (await response.json()) as OpenLibrarySearchResponse;
  const results = (data.docs ?? []).map(mapDocToResult);
  return { results, total: data.numFound ?? results.length };
}

export async function getOpenLibraryWorkDetails(
  workKey: string,
): Promise<OpenLibraryWork & { key: string }> {
  const key = normalizeWorkKey(workKey);
  const response = await fetch(`${OPEN_LIBRARY_BASE}${key}.json`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(
      `Open Library work fetch failed (${response.status}) for ${key}`,
    );
  }

  const data = (await response.json()) as OpenLibraryWork;
  return { ...data, key };
}

export async function getOpenLibraryEditionDetails(
  editionKey: string,
): Promise<OpenLibraryEdition & { key: string }> {
  const key = normalizeEditionKey(editionKey);
  const response = await fetch(`${OPEN_LIBRARY_BASE}${key}.json`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(
      `Open Library edition fetch failed (${response.status}) for ${key}`,
    );
  }

  const data = (await response.json()) as OpenLibraryEdition;
  return { ...data, key };
}

function descriptionFromWork(work: OpenLibraryWork): string | undefined {
  if (!work.description) return undefined;
  if (typeof work.description === "string") return work.description;
  return work.description.value;
}

/**
 * Fill missing page count (and optionally description) from edition/work.
 */
export async function enrichWithPageCount(
  result: BookSearchResult,
): Promise<BookSearchResult> {
  if (result.pageCount && result.pageCount > 0 && result.description) {
    return result;
  }

  let next: BookSearchResult = { ...result };

  if ((!next.pageCount || next.pageCount <= 0) && next.openLibraryEditionKey) {
    try {
      const edition = await getOpenLibraryEditionDetails(
        next.openLibraryEditionKey,
      );
      if (edition.number_of_pages && edition.number_of_pages > 0) {
        next = { ...next, pageCount: edition.number_of_pages };
      }
      if (!next.isbn10 && edition.isbn_10?.[0]) {
        next = { ...next, isbn10: edition.isbn_10[0] };
      }
      if (!next.isbn13 && edition.isbn_13?.[0]) {
        next = { ...next, isbn13: edition.isbn_13[0] };
      }
      if (!next.coverUrl && edition.covers?.[0]) {
        next = { ...next, coverUrl: coverUrlFromId(edition.covers[0]) };
      }
    } catch {
      // Best-effort enrichment
    }
  }

  if (
    ((!next.pageCount || next.pageCount <= 0) || !next.description) &&
    next.openLibraryWorkKey
  ) {
    try {
      const work = await getOpenLibraryWorkDetails(next.openLibraryWorkKey);
      const description = descriptionFromWork(work);
      if (!next.description && description) {
        next = { ...next, description };
      }
      if (!next.coverUrl && work.covers?.[0]) {
        next = { ...next, coverUrl: coverUrlFromId(work.covers[0]) };
      }
    } catch {
      // Best-effort enrichment
    }
  }

  return next;
}
