import Papa from "papaparse";
import type { BookStatus } from "@/types/database";

export type ImportColumnTarget =
  | "title"
  | "author"
  | "page_count"
  | "status"
  | "notes";

const HEADER_ALIASES: Record<ImportColumnTarget, string[]> = {
  title: ["title", "book", "book title", "name", "название", "книга"],
  author: [
    "author",
    "authors",
    "writer",
    "writer(s)",
    "автор",
    "авторы",
  ],
  page_count: [
    "page_count",
    "pages",
    "page count",
    "pagecount",
    "num pages",
    "number of pages",
    "страницы",
    "кол-во страниц",
  ],
  status: ["status", "state", "статус"],
  notes: ["notes", "note", "club note", "comments", "comment", "заметки"],
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse CSV text into a matrix of string cells (header row included).
 */
export function parseCsv(text: string): string[][] {
  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
    const first = parsed.errors[0];
    throw new Error(first?.message || "Failed to parse CSV");
  }

  return (parsed.data ?? []).map((row) =>
    row.map((cell) => (cell == null ? "" : String(cell).trim())),
  );
}

/**
 * Suggest mapping from CSV header labels to import field names.
 */
export function suggestColumnMapping(
  headers: string[],
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedTargets = new Set<ImportColumnTarget>();

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    if (!normalized) continue;

    for (const [target, aliases] of Object.entries(HEADER_ALIASES) as Array<
      [ImportColumnTarget, string[]]
    >) {
      if (usedTargets.has(target)) continue;
      if (aliases.includes(normalized)) {
        mapping[header] = target;
        usedTargets.add(target);
        break;
      }
    }
  }

  return mapping;
}

const STATUS_ALIASES: Record<string, BookStatus> = {
  candidate: "candidate",
  candidates: "candidate",
  "to read": "candidate",
  toread: "candidate",
  wishlist: "candidate",
  suggested: "candidate",
  currently_reading: "currently_reading",
  "currently reading": "currently_reading",
  reading: "currently_reading",
  current: "currently_reading",
  previously_read: "previously_read",
  "previously read": "previously_read",
  read: "previously_read",
  finished: "previously_read",
  done: "previously_read",
  archived: "archived",
  archive: "archived",
  hidden: "archived",
};

export function normalizeImportedStatus(raw: string): BookStatus | null {
  const key = raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!key) return null;
  return STATUS_ALIASES[key] ?? null;
}
