"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { Book, BookSearchResult } from "@/types/database";
import { findDuplicateMatches } from "@/lib/books/duplicates";
import {
  duplicateSuggestCode,
  searchResultToCandidateInput,
} from "@/lib/books/suggest";
import {
  createCandidateBookTrusted,
  listBooksForDuplicateCheck,
  restoreBookToCandidateTrusted,
} from "@/lib/data/books";
import { createBookSchema } from "@/lib/validations/book";
import { suggestBookSearchResultSchema } from "@/lib/validations/suggest-book";
import {
  hashIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/auth/rate-limit";
import { hasSupabaseServiceRole, isSupabaseConfigured } from "@/lib/supabase/env";

export type SuggestBookCode =
  | "added"
  | "restored"
  | "already_in_pool"
  | "already_current"
  | "already_read"
  | "rate_limited"
  | "invalid"
  | "unavailable";

export type SuggestBookResult = {
  ok: boolean;
  code: SuggestBookCode;
  data?: Book;
};

const SUGGEST_MAX = 12;
const SUGGEST_WINDOW_MS = 15 * 60 * 1000;

async function clientIpHash(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  return hashIp(`suggest:${ip}`);
}

async function revalidatePublicBooks() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/randomizer`);
  revalidatePath(`/${locale}/books`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/books`);
  revalidatePath(`/${locale}/admin/randomizer`);
}

export async function suggestCandidateBook(
  input: BookSearchResult,
): Promise<SuggestBookResult> {
  if (isSupabaseConfigured() && !hasSupabaseServiceRole()) {
    return { ok: false, code: "unavailable" };
  }

  const ipHash = await clientIpHash();
  if (isRateLimited(ipHash, Date.now(), SUGGEST_MAX, SUGGEST_WINDOW_MS)) {
    return { ok: false, code: "rate_limited" };
  }
  recordAttempt(ipHash, Date.now(), SUGGEST_WINDOW_MS);

  const parsedSearch = suggestBookSearchResultSchema.safeParse(input);
  if (!parsedSearch.success) {
    return { ok: false, code: "invalid" };
  }

  const candidate = searchResultToCandidateInput(
    parsedSearch.data as BookSearchResult,
  );
  const parsedBook = createBookSchema.safeParse(candidate);
  if (!parsedBook.success) {
    return { ok: false, code: "invalid" };
  }

  try {
    const existing = await listBooksForDuplicateCheck();
    const duplicates = findDuplicateMatches(existing, parsedBook.data);
    const match = duplicates[0];

    if (match) {
      const code = duplicateSuggestCode(match);
      if (code === "restore_archived") {
        const restored = await restoreBookToCandidateTrusted(match.id);
        await revalidatePublicBooks();
        return { ok: true, code: "restored", data: restored };
      }
      return { ok: false, code, data: match };
    }

    const created = await createCandidateBookTrusted(parsedBook.data);
    await revalidatePublicBooks();
    return { ok: true, code: "added", data: created };
  } catch {
    return { ok: false, code: "unavailable" };
  }
}
