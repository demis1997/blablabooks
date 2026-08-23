import type { BookSearchResult } from "@/types/database";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

type GoogleBooksVolumeInfo = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  language?: string;
  categories?: string[];
  industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
};

type GoogleBooksItem = {
  id?: string;
  volumeInfo?: GoogleBooksVolumeInfo;
};

type GoogleBooksResponse = {
  items?: GoogleBooksItem[];
  totalItems?: number;
};

function withApiKey(url: URL): URL {
  const key = process.env.GOOGLE_BOOKS_API_KEY?.trim();
  if (key) {
    url.searchParams.set("key", key);
  }
  return url;
}

function mapVolume(item: GoogleBooksItem): BookSearchResult | null {
  const info = item.volumeInfo;
  if (!info?.title) return null;

  let isbn10: string | undefined;
  let isbn13: string | undefined;
  for (const id of info.industryIdentifiers ?? []) {
    if (id.type === "ISBN_10" && id.identifier) isbn10 = id.identifier;
    if (id.type === "ISBN_13" && id.identifier) isbn13 = id.identifier;
  }

  const year = info.publishedDate
    ? Number.parseInt(info.publishedDate.slice(0, 4), 10)
    : undefined;

  const cover =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ||
    info.imageLinks?.smallThumbnail?.replace("http://", "https://");

  return {
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors ?? [],
    firstPublishYear: Number.isFinite(year) ? year : undefined,
    pageCount: info.pageCount && info.pageCount > 0 ? info.pageCount : undefined,
    language: info.language,
    isbn10,
    isbn13,
    subjects: info.categories,
    coverUrl: cover,
    googleBooksId: item.id,
    description: info.description,
    provider: "google_books",
  };
}

/**
 * Google Books search — used as a metadata fallback (especially page count).
 * Works without GOOGLE_BOOKS_API_KEY at a lower quota.
 */
export async function searchGoogleBooks(
  query: string,
): Promise<BookSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = withApiKey(new URL(GOOGLE_BOOKS_API));
  url.searchParams.set("q", trimmed);
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("printType", "books");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `Google Books search failed (${response.status} ${response.statusText})`,
    );
  }

  const data = (await response.json()) as GoogleBooksResponse;
  return (data.items ?? [])
    .map(mapVolume)
    .filter((item): item is BookSearchResult => item != null);
}

export type GoogleBooksPageCountQuery =
  | { isbn: string }
  | { title: string; author?: string };

/**
 * Look up page count by ISBN or title (+ optional author).
 */
export async function getGoogleBooksPageCount(
  query: GoogleBooksPageCountQuery,
): Promise<number | null> {
  let q: string;
  if ("isbn" in query && query.isbn.trim()) {
    q = `isbn:${query.isbn.trim()}`;
  } else if ("title" in query && query.title.trim()) {
    const parts = [`intitle:${query.title.trim()}`];
    if (query.author?.trim()) {
      parts.push(`inauthor:${query.author.trim()}`);
    }
    q = parts.join("+");
  } else {
    return null;
  }

  try {
    const results = await searchGoogleBooks(q);
    const withPages = results.find(
      (r) => typeof r.pageCount === "number" && r.pageCount > 0,
    );
    return withPages?.pageCount ?? null;
  } catch {
    return null;
  }
}
