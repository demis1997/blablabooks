import type { Book, BookStatus } from "@/types/database";
import {
  hasSupabaseServiceRole,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, createClientOrThrow } from "@/lib/supabase/server";
import {
  getDemoBooks,
  getDemoCurrentBook,
  mutateDemoStore,
  appendDemoActivity,
} from "@/lib/demo-data";
import { normalizeAuthors, normalizeTitle } from "@/lib/books/normalize";
import type { CreateBookInput, UpdateBookInput } from "@/lib/validations/book";

export type BookSort = "date_added" | "title" | "author" | "page_count";

export type ListBooksFilters = {
  status?: BookStatus | BookStatus[];
  search?: string;
  sort?: BookSort;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export type ListBooksResult = {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
};

function matchesSearch(book: Book, search: string): boolean {
  const q = search.toLowerCase();
  return (
    book.title.toLowerCase().includes(q) ||
    book.authors.some((a) => a.toLowerCase().includes(q)) ||
    (book.isbn_13?.includes(q) ?? false) ||
    (book.isbn_10?.toLowerCase().includes(q) ?? false)
  );
}

function sortBooks(books: Book[], sort: BookSort): Book[] {
  const sorted = [...books];
  switch (sort) {
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "author":
      return sorted.sort((a, b) =>
        (a.authors[0] ?? "").localeCompare(b.authors[0] ?? ""),
      );
    case "page_count":
      return sorted.sort(
        (a, b) => (a.page_count ?? 0) - (b.page_count ?? 0),
      );
    case "date_added":
    default:
      return sorted.sort((a, b) =>
        b.date_added.localeCompare(a.date_added),
      );
  }
}

function filterDemoBooks(filters: ListBooksFilters): ListBooksResult {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const sort = filters.sort ?? "date_added";

  let books = getDemoBooks();

  if (!filters.includeArchived) {
    books = books.filter((b) => !b.is_archived);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];
    books = books.filter((b) => statuses.includes(b.status));
  }

  if (filters.search?.trim()) {
    books = books.filter((b) => matchesSearch(b, filters.search!.trim()));
  }

  books = sortBooks(books, sort);
  const total = books.length;
  const start = (page - 1) * pageSize;

  return {
    books: books.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

export async function listBooks(
  filters: ListBooksFilters = {},
): Promise<ListBooksResult> {
  if (!isSupabaseConfigured()) {
    return filterDemoBooks(filters);
  }

  const supabase = await createClient();
  if (!supabase) return filterDemoBooks(filters);

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const sort = filters.sort ?? "date_added";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("books").select("*", { count: "exact" });

  if (!filters.includeArchived) {
    query = query.eq("is_archived", false);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];
    query = query.in("status", statuses);
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `title.ilike.%${q}%,isbn_13.ilike.%${q}%,isbn_10.ilike.%${q}%`,
    );
  }

  switch (sort) {
    case "title":
      query = query.order("title", { ascending: true });
      break;
    case "author":
      query = query.order("authors", { ascending: true });
      break;
    case "page_count":
      query = query.order("page_count", { ascending: true, nullsFirst: false });
      break;
    case "date_added":
    default:
      query = query.order("date_added", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to list books: ${error.message}`);
  }

  return {
    books: (data ?? []) as Book[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getBookById(id: string): Promise<Book | null> {
  if (!isSupabaseConfigured()) {
    return getDemoBooks().find((b) => b.id === id) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return getDemoBooks().find((b) => b.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get book: ${error.message}`);
  }

  return (data as Book | null) ?? null;
}

export async function getCurrentBook(): Promise<Book | null> {
  if (!isSupabaseConfigured()) {
    return getDemoCurrentBook();
  }

  const supabase = await createClient();
  if (!supabase) return getDemoCurrentBook();

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("status", "currently_reading")
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get current book: ${error.message}`);
  }

  return (data as Book | null) ?? null;
}

export async function getCandidateBooks(): Promise<Book[]> {
  const { books } = await listBooks({
    status: "candidate",
    sort: "date_added",
    pageSize: 100,
  });
  return books;
}

export async function listBooksForDuplicateCheck(): Promise<Book[]> {
  if (!isSupabaseConfigured()) {
    return getDemoBooks();
  }

  if (hasSupabaseServiceRole()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("books").select("*");
    if (error) {
      throw new Error(`Failed to list books: ${error.message}`);
    }
    return (data ?? []) as Book[];
  }

  const { books } = await listBooks({
    includeArchived: true,
    pageSize: 100,
  });
  return books;
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const normalized_title = normalizeTitle(input.title);
  const normalized_authors = normalizeAuthors(input.authors);
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const created: Book = {
      id: crypto.randomUUID(),
      title: input.title,
      subtitle: input.subtitle ?? null,
      authors: input.authors,
      page_count: input.page_count ?? null,
      description: input.description ?? null,
      description_ru: input.description_ru ?? null,
      isbn_10: input.isbn_10 ?? null,
      isbn_13: input.isbn_13 ?? null,
      first_publish_year: input.first_publish_year ?? null,
      edition_publish_year: input.edition_publish_year ?? null,
      language: input.language ?? null,
      subjects: input.subjects ?? [],
      open_library_work_key: input.open_library_work_key ?? null,
      open_library_edition_key: input.open_library_edition_key ?? null,
      google_books_id: input.google_books_id ?? null,
      cover_url: input.cover_url ?? null,
      custom_cover_path: input.custom_cover_path ?? null,
      status: input.status ?? "candidate",
      selected_month: input.selected_month ?? null,
      selected_year: input.selected_year ?? null,
      club_note: input.club_note ?? null,
      club_note_ru: input.club_note_ru ?? null,
      normalized_title,
      normalized_authors,
      is_archived: false,
      date_added: now.slice(0, 10),
      created_at: now,
      updated_at: now,
      created_by: null,
    };

    mutateDemoStore((draft) => {
      draft.books = [created, ...draft.books];
    });
    appendDemoActivity({
      admin_id: null,
      action: "book.created",
      entity_type: "book",
      entity_id: created.id,
      details: { title: created.title },
    });
    return created;
  }

  const supabase = await createClientOrThrow();
  const { data, error } = await supabase
    .from("books")
    .insert({
      ...input,
      normalized_title,
      normalized_authors,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create book: ${error.message}`);
  }

  return data as Book;
}

export async function createCandidateBookTrusted(
  input: CreateBookInput,
): Promise<Book> {
  const candidate: CreateBookInput = {
    ...input,
    status: "candidate",
    selected_month: null,
    selected_year: null,
  };

  if (!isSupabaseConfigured()) {
    return createBook(candidate);
  }

  if (!hasSupabaseServiceRole()) {
    throw new Error("Book suggestions are unavailable.");
  }

  const normalized_title = normalizeTitle(candidate.title);
  const normalized_authors = normalizeAuthors(candidate.authors);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("books")
    .insert({
      ...candidate,
      normalized_title,
      normalized_authors,
      is_archived: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create book: ${error.message}`);
  }

  return data as Book;
}

export async function restoreBookToCandidateTrusted(id: string): Promise<Book> {
  if (!isSupabaseConfigured()) {
    return updateBook({
      id,
      status: "candidate",
      is_archived: false,
    });
  }

  if (!hasSupabaseServiceRole()) {
    throw new Error("Book suggestions are unavailable.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("books")
    .update({
      status: "candidate",
      is_archived: false,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to restore book: ${error.message}`);
  }

  return data as Book;
}

export async function updateBook(input: UpdateBookInput): Promise<Book> {
  const { id, ...rest } = input;

  if (!isSupabaseConfigured()) {
    let updated: Book | null = null;
    mutateDemoStore((draft) => {
      const index = draft.books.findIndex((b) => b.id === id);
      if (index === -1) return;
      const current = draft.books[index]!;
      const next: Book = {
        ...current,
        ...rest,
        title: rest.title ?? current.title,
        authors: rest.authors ?? current.authors,
        updated_at: new Date().toISOString(),
      };
      if (rest.title || rest.authors) {
        next.normalized_title = normalizeTitle(next.title);
        next.normalized_authors = normalizeAuthors(next.authors);
      }
      draft.books[index] = next;
      updated = next;
    });
    if (!updated) {
      throw new Error(`Book not found: ${id}`);
    }
    appendDemoActivity({
      admin_id: null,
      action: "book.updated",
      entity_type: "book",
      entity_id: id,
      details: { fields: Object.keys(rest) },
    });
    return updated;
  }

  const supabase = await createClientOrThrow();
  const patch: Record<string, unknown> = { ...rest };

  if (rest.title || rest.authors) {
    const existing = await getBookById(id);
    if (!existing) throw new Error(`Book not found: ${id}`);
    const title = rest.title ?? existing.title;
    const authors = rest.authors ?? existing.authors;
    patch.normalized_title = normalizeTitle(title);
    patch.normalized_authors = normalizeAuthors(authors);
  }

  const { data, error } = await supabase
    .from("books")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update book: ${error.message}`);
  }

  return data as Book;
}
