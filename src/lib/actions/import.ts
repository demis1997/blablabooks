"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { BookStatus, ImportRecord } from "@/types/database";
import {
  parseCsv,
  suggestColumnMapping,
  normalizeImportedStatus,
  type ImportColumnTarget,
} from "@/lib/books/csv";
import { findDuplicateMatches } from "@/lib/books/duplicates";
import { searchBooks } from "@/lib/books/search";
import { createBook as createBookRecord, listBooks } from "@/lib/data/books";
import type { CreateBookInput } from "@/lib/validations/book";
import { createBookSchema } from "@/lib/validations/book";
import { addImport, getDemoImports } from "@/lib/demo-data";
import { getAdminId, requireAdmin } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { GOOGLE_SHEETS_CSV_URL } from "@/lib/constants";
import { logActivity } from "@/lib/data/activity";

export type ImportPreviewRow = {
  rowIndex: number;
  title: string;
  authors: string[];
  page_count: number | null;
  status: BookStatus | null;
  notes: string | null;
  raw: Record<string, string>;
  incomplete: boolean;
  duplicateIds: string[];
  proposals?: Array<{
    title: string;
    authors: string[];
    pageCount?: number;
    coverUrl?: string;
    isbn13?: string;
    openLibraryWorkKey?: string;
    confidence: "high" | "medium" | "low";
  }>;
};

export type ImportPreviewResult = {
  ok: boolean;
  error?: string;
  headers?: string[];
  mapping?: Record<string, string>;
  rows?: ImportPreviewRow[];
  sourceType?: ImportRecord["source_type"];
  sourceUrl?: string | null;
  filename?: string | null;
};

export type ImportCommitInput = {
  sourceType: ImportRecord["source_type"];
  sourceUrl?: string | null;
  filename?: string | null;
  mapping: Record<string, string>;
  rows: Array<{
    title: string;
    authors: string[];
    page_count?: number | null;
    status?: BookStatus | null;
    notes?: string | null;
    skip?: boolean;
    overrideDuplicate?: boolean;
    acceptedProposal?: {
      title: string;
      authors: string[];
      page_count?: number | null;
      isbn_13?: string | null;
      open_library_work_key?: string | null;
      cover_url?: string | null;
    };
  }>;
};

export type ImportCommitResult = {
  ok: boolean;
  error?: string;
  report?: {
    added: number;
    skipped: number;
    duplicates: number;
    failed: number;
    failures: string[];
  };
  importId?: string;
};

function mapRow(
  headers: string[],
  cells: string[],
  mapping: Record<string, string>,
): {
  title: string;
  authors: string[];
  page_count: number | null;
  status: BookStatus | null;
  notes: string | null;
  raw: Record<string, string>;
} {
  const raw: Record<string, string> = {};
  headers.forEach((h, i) => {
    raw[h] = cells[i] ?? "";
  });

  let title = "";
  let authors: string[] = [];
  let page_count: number | null = null;
  let status: BookStatus | null = null;
  let notes: string | null = null;

  for (const [header, target] of Object.entries(mapping)) {
    const value = raw[header]?.trim() ?? "";
    if (!value || target === "ignore") continue;
    switch (target as ImportColumnTarget | "ignore") {
      case "title":
        title = value;
        break;
      case "author":
        authors = value
          .split(/[,;|&]/)
          .map((a) => a.trim())
          .filter(Boolean);
        break;
      case "page_count": {
        const n = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
        page_count = Number.isFinite(n) && n > 0 ? n : null;
        break;
      }
      case "status":
        status = normalizeImportedStatus(value);
        break;
      case "notes":
        notes = value;
        break;
      default:
        break;
    }
  }

  return { title, authors, page_count, status, notes, raw };
}

async function loadCsvText(source: {
  url?: string;
  csvText?: string;
}): Promise<string> {
  if (source.csvText) return source.csvText;
  if (!source.url) throw new Error("No CSV source provided");
  const res = await fetch(source.url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`);
  return res.text();
}

export async function previewImport(input: {
  url?: string;
  csvText?: string;
  filename?: string | null;
  mapping?: Record<string, string>;
  enrichIncomplete?: boolean;
}): Promise<ImportPreviewResult> {
  await requireAdmin();

  try {
    const text = await loadCsvText(input);
    const matrix = parseCsv(text);
    if (matrix.length < 2) {
      return { ok: false, error: "CSV has no data rows" };
    }

    const headers = matrix[0]!;
    const mapping = input.mapping ?? suggestColumnMapping(headers);
    const { books: existing } = await listBooks({
      includeArchived: true,
      pageSize: 100,
    });

    const rows: ImportPreviewRow[] = [];

    for (let i = 1; i < matrix.length; i += 1) {
      const mapped = mapRow(headers, matrix[i]!, mapping);
      const incomplete = !mapped.title || mapped.authors.length === 0;
      const duplicates = findDuplicateMatches(existing, {
        title: mapped.title,
        authors: mapped.authors,
      });

      const row: ImportPreviewRow = {
        rowIndex: i,
        title: mapped.title,
        authors: mapped.authors,
        page_count: mapped.page_count,
        status: mapped.status,
        notes: mapped.notes,
        raw: mapped.raw,
        incomplete,
        duplicateIds: duplicates.map((d) => d.id),
      };

      if (incomplete && input.enrichIncomplete !== false && mapped.title) {
        try {
          const { results } = await searchBooks(mapped.title, {
            limit: 3,
            enrichPageCount: false,
            includeGoogleFallback: false,
          });
          row.proposals = results.map((r, idx) => ({
            title: r.title,
            authors: r.authors,
            pageCount: r.pageCount,
            coverUrl: r.coverUrl,
            isbn13: r.isbn13,
            openLibraryWorkKey: r.openLibraryWorkKey,
            confidence: (idx === 0 ? "high" : idx === 1 ? "medium" : "low") as
              | "high"
              | "medium"
              | "low",
          }));
        } catch {
          row.proposals = [];
        }
      }

      rows.push(row);
    }

    const sourceType: ImportRecord["source_type"] = input.url
      ? "google_sheets"
      : "csv_upload";

    return {
      ok: true,
      headers,
      mapping,
      rows,
      sourceType,
      sourceUrl: input.url ?? null,
      filename: input.filename ?? null,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Preview failed",
    };
  }
}

export async function commitImport(
  input: ImportCommitInput,
): Promise<ImportCommitResult> {
  await requireAdmin();

  let added = 0;
  let skipped = 0;
  let duplicates = 0;
  let failed = 0;
  const failures: string[] = [];

  const { books: existing } = await listBooks({
    includeArchived: true,
    pageSize: 100,
  });

  for (const row of input.rows) {
    if (row.skip) {
      skipped += 1;
      continue;
    }

    const payload = row.acceptedProposal
      ? {
          title: row.acceptedProposal.title,
          authors: row.acceptedProposal.authors,
          page_count: row.acceptedProposal.page_count ?? row.page_count ?? null,
          isbn_13: row.acceptedProposal.isbn_13 ?? null,
          open_library_work_key:
            row.acceptedProposal.open_library_work_key ?? null,
          cover_url: row.acceptedProposal.cover_url ?? null,
          club_note: row.notes ?? null,
          status: row.status ?? ("candidate" as BookStatus),
        }
      : {
          title: row.title,
          authors: row.authors,
          page_count: row.page_count ?? null,
          club_note: row.notes ?? null,
          status: row.status ?? ("candidate" as BookStatus),
        };

    if (!payload.title || !payload.authors.length) {
      failed += 1;
      failures.push(`Missing title/authors: ${payload.title || "(empty)"}`);
      continue;
    }

    const matches = findDuplicateMatches(existing, payload);
    if (matches.length > 0 && !row.overrideDuplicate) {
      duplicates += 1;
      continue;
    }

    try {
      const parsedBook = createBookSchema.safeParse({
        ...payload,
        subjects: [],
      });
      if (!parsedBook.success) {
        failed += 1;
        failures.push(
          parsedBook.error.issues[0]?.message ??
            `Invalid: ${payload.title}`,
        );
        continue;
      }
      const created = await createBookRecord(parsedBook.data as CreateBookInput);
      existing.push(created);
      added += 1;
    } catch (e) {
      failed += 1;
      failures.push(
        e instanceof Error ? e.message : `Failed: ${payload.title}`,
      );
    }
  }

  const now = new Date().toISOString();
  const record: ImportRecord = {
    id: crypto.randomUUID(),
    source_type: input.sourceType,
    source_url: input.sourceUrl ?? null,
    filename: input.filename ?? null,
    status:
      failed > 0 && added > 0
        ? "partial"
        : failed > 0 && added === 0
          ? "failed"
          : "completed",
    column_mapping: input.mapping,
    total_rows: input.rows.length,
    added_count: added,
    skipped_count: skipped,
    duplicate_count: duplicates,
    failed_count: failed,
    report: { failures },
    created_at: now,
    created_by: await getAdminId(),
  };

  if (!isSupabaseConfigured()) {
    addImport(record);
  } else {
    const supabase = await createClient();
    if (supabase) {
      await supabase.from("imports").insert(record);
    }
  }

  await logActivity({
    admin_id: await getAdminId(),
    action: "import.completed",
    entity_type: "import",
    entity_id: record.id,
    details: {
      added,
      skipped,
      duplicates,
      failed,
    },
  });

  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/import`);
  revalidatePath(`/${locale}/admin/books`);
  revalidatePath(`/${locale}/books`);

  return {
    ok: true,
    importId: record.id,
    report: { added, skipped, duplicates, failed, failures },
  };
}

export async function getDefaultSheetsUrl(): Promise<string> {
  return GOOGLE_SHEETS_CSV_URL;
}

export async function listImportHistory(): Promise<ImportRecord[]> {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    return getDemoImports();
  }
  const supabase = await createClient();
  if (!supabase) return getDemoImports();
  const { data } = await supabase
    .from("imports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as ImportRecord[];
}
