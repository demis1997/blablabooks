import type { Book, BookSearchResult } from "@/types/database";

export type SuggestDuplicateCode =
  | "already_in_pool"
  | "already_current"
  | "already_read"
  | "restore_archived";

export function optionalHttpUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export function searchResultToCandidateInput(result: BookSearchResult) {
  const authors = result.authors.map((name) => name.trim()).filter(Boolean);

  return {
    title: result.title.trim(),
    subtitle: result.subtitle?.trim() ? result.subtitle.trim() : null,
    authors: authors.length ? authors : ["Unknown"],
    page_count:
      result.pageCount && result.pageCount > 0 ? result.pageCount : null,
    description: result.description?.trim() ? result.description.trim() : null,
    isbn_10: result.isbn10?.trim() ? result.isbn10.trim() : null,
    isbn_13: result.isbn13?.trim() ? result.isbn13.trim() : null,
    first_publish_year:
      result.firstPublishYear &&
      result.firstPublishYear >= 1000 &&
      result.firstPublishYear <= 3000
        ? result.firstPublishYear
        : null,
    language: result.language?.trim() ? result.language.trim() : null,
    subjects: (result.subjects ?? []).map((s) => s.trim()).filter(Boolean),
    open_library_work_key: result.openLibraryWorkKey ?? null,
    open_library_edition_key: result.openLibraryEditionKey ?? null,
    google_books_id: result.googleBooksId ?? null,
    cover_url: optionalHttpUrl(result.coverUrl),
    status: "candidate",
    selected_month: null,
    selected_year: null,
  };
}

export function duplicateSuggestCode(book: Book): SuggestDuplicateCode {
  if (book.is_archived || book.status === "archived") {
    return "restore_archived";
  }
  if (book.status === "currently_reading") return "already_current";
  if (book.status === "previously_read") return "already_read";
  return "already_in_pool";
}
