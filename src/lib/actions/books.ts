"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { Book, BookStatus } from "@/types/database";
import {
  createBook as createBookRecord,
  getBookById,
  listBooks,
  updateBook as updateBookRecord,
} from "@/lib/data/books";
import { findDuplicateMatches } from "@/lib/books/duplicates";
import { enrichWithPageCount } from "@/lib/books/open-library";
import { getAdminId, requireAdmin } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { deleteBook as demoDeleteBook } from "@/lib/demo-data";
import { logActivity } from "@/lib/data/activity";
import {
  createBookSchema,
  updateBookSchema,
} from "@/lib/validations/book";

export type ActionResult<T = unknown> = {
  ok: boolean;
  error?: string;
  data?: T;
  duplicates?: Book[];
};

async function revalidateBooks() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/books`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/books`);
  revalidatePath(`/${locale}`);
}

export async function createBook(
  input: Record<string, unknown> & {
    title: string;
    authors: string[];
    overrideDuplicate?: boolean;
  },
): Promise<ActionResult<Book>> {
  await requireAdmin();
  const { overrideDuplicate, ...rest } = input;
  const parsed = createBookSchema.safeParse(rest);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid book" };
  }

  const { books: existing } = await listBooks({
    includeArchived: true,
    pageSize: 100,
  });
  const duplicates = findDuplicateMatches(existing, parsed.data);
  if (duplicates.length > 0 && !overrideDuplicate) {
    return {
      ok: false,
      error: "duplicate",
      duplicates,
    };
  }

  const book = await createBookRecord(parsed.data);
  await revalidateBooks();
  return { ok: true, data: book };
}

export async function updateBook(
  input: Record<string, unknown> & { id: string },
): Promise<ActionResult<Book>> {
  await requireAdmin();
  const parsed = updateBookSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid book" };
  }

  try {
    const book = await updateBookRecord(parsed.data);
    await revalidateBooks();
    return { ok: true, data: book };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function archiveBook(id: string): Promise<ActionResult<Book>> {
  await requireAdmin();
  try {
    const book = await updateBookRecord({
      id,
      is_archived: true,
      status: "archived",
    });
    await logActivity({
      admin_id: await getAdminId(),
      action: "book.archived",
      entity_type: "book",
      entity_id: id,
    });
    await revalidateBooks();
    return { ok: true, data: book };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Archive failed" };
  }
}

export async function restoreBook(id: string): Promise<ActionResult<Book>> {
  await requireAdmin();
  try {
    const book = await updateBookRecord({
      id,
      is_archived: false,
      status: "candidate",
    });
    await logActivity({
      admin_id: await getAdminId(),
      action: "book.restored",
      entity_type: "book",
      entity_id: id,
    });
    await revalidateBooks();
    return { ok: true, data: book };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Restore failed" };
  }
}

export async function deleteBook(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const removed = demoDeleteBook(id);
    if (!removed) return { ok: false, error: "Book not found" };
    await logActivity({
      admin_id: await getAdminId(),
      action: "book.deleted",
      entity_type: "book",
      entity_id: id,
    });
    await revalidateBooks();
    return { ok: true };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase unavailable" };

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logActivity({
    admin_id: await getAdminId(),
    action: "book.deleted",
    entity_type: "book",
    entity_id: id,
  });
  await revalidateBooks();
  return { ok: true };
}

export async function bulkUpdateStatus(
  ids: string[],
  status: BookStatus,
): Promise<ActionResult<{ count: number }>> {
  await requireAdmin();
  if (!ids.length) return { ok: false, error: "No books selected" };

  let count = 0;
  for (const id of ids) {
    await updateBookRecord({
      id,
      status,
      is_archived: status === "archived",
    });
    count += 1;
  }

  await logActivity({
    admin_id: await getAdminId(),
    action: "book.bulk_status",
    entity_type: "book",
    entity_id: null,
    details: { ids, status, count },
  });
  await revalidateBooks();
  return { ok: true, data: { count } };
}

export async function refreshMetadata(
  id: string,
): Promise<ActionResult<Book>> {
  await requireAdmin();
  const book = await getBookById(id);
  if (!book) return { ok: false, error: "Book not found" };

  try {
    const enriched = await enrichWithPageCount({
      title: book.title,
      subtitle: book.subtitle ?? undefined,
      authors: book.authors,
      firstPublishYear: book.first_publish_year ?? undefined,
      pageCount: book.page_count ?? undefined,
      language: book.language ?? undefined,
      isbn10: book.isbn_10 ?? undefined,
      isbn13: book.isbn_13 ?? undefined,
      subjects: book.subjects,
      coverUrl: book.cover_url ?? undefined,
      openLibraryWorkKey: book.open_library_work_key ?? undefined,
      openLibraryEditionKey: book.open_library_edition_key ?? undefined,
      googleBooksId: book.google_books_id ?? undefined,
      description: book.description ?? undefined,
      provider: "open_library",
    });

    const updated = await updateBookRecord({
      id,
      page_count: enriched.pageCount ?? book.page_count,
      description: enriched.description ?? book.description,
      cover_url: enriched.coverUrl ?? book.cover_url,
      isbn_10: enriched.isbn10 ?? book.isbn_10,
      isbn_13: enriched.isbn13 ?? book.isbn_13,
    });

    await revalidateBooks();
    return { ok: true, data: updated };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Metadata refresh failed",
    };
  }
}

export async function setCurrentBook(
  id: string,
  month?: number,
  year?: number,
): Promise<ActionResult<Book>> {
  await requireAdmin();
  const now = new Date();
  const selectedMonth = month ?? now.getMonth() + 1;
  const selectedYear = year ?? now.getFullYear();

  const { books: current } = await listBooks({
    status: "currently_reading",
    includeArchived: false,
    pageSize: 50,
  });

  const already = current.find((book) => book.id === id);
  if (
    already &&
    already.selected_month === selectedMonth &&
    already.selected_year === selectedYear
  ) {
    return {
      ok: false,
      error: "This book is already confirmed for that month.",
    };
  }

  for (const book of current) {
    if (book.id !== id) {
      await updateBookRecord({
        id: book.id,
        status: "previously_read",
      });
    }
  }

  const updated = await updateBookRecord({
    id,
    status: "currently_reading",
    selected_month: selectedMonth,
    selected_year: selectedYear,
    is_archived: false,
  });

  await logActivity({
    admin_id: await getAdminId(),
    action: "book.set_current",
    entity_type: "book",
    entity_id: id,
    details: { month: selectedMonth, year: selectedYear },
  });
  await revalidateBooks();
  revalidatePath(`/${await getLocale()}/admin/current-book`);
  return { ok: true, data: updated };
}

export async function markAsRead(id: string): Promise<ActionResult<Book>> {
  await requireAdmin();
  const updated = await updateBookRecord({
    id,
    status: "previously_read",
  });
  await logActivity({
    admin_id: await getAdminId(),
    action: "book.marked_read",
    entity_type: "book",
    entity_id: id,
  });
  await revalidateBooks();
  revalidatePath(`/${await getLocale()}/admin/current-book`);
  return { ok: true, data: updated };
}

export async function clearCurrentBook(): Promise<ActionResult> {
  await requireAdmin();
  const current = await listBooks({
    status: "currently_reading",
    includeArchived: false,
    pageSize: 50,
  });
  for (const book of current.books) {
    await updateBookRecord({ id: book.id, status: "candidate" });
  }
  await revalidateBooks();
  return { ok: true };
}
