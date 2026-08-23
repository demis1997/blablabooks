import { describe, expect, it } from "vitest";
import { booksToCsv } from "@/lib/books/export-csv";
import type { Book } from "@/types/database";

const sample: Book = {
  id: "1",
  title: 'Hello, "World"',
  subtitle: null,
  authors: ["A Author", "B Writer"],
  page_count: 200,
  description: null,
  description_ru: null,
  isbn_10: null,
  isbn_13: "9781234567890",
  first_publish_year: 2020,
  edition_publish_year: null,
  language: "eng",
  subjects: [],
  open_library_work_key: "/works/OL1W",
  open_library_edition_key: null,
  google_books_id: null,
  cover_url: null,
  custom_cover_path: null,
  status: "candidate",
  selected_month: null,
  selected_year: null,
  club_note: "Line\nbreak",
  club_note_ru: null,
  normalized_title: "hello world",
  normalized_authors: "a author b writer",
  is_archived: false,
  date_added: "2026-01-01",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  created_by: null,
};

describe("booksToCsv", () => {
  it("escapes commas quotes and newlines", () => {
    const csv = booksToCsv([sample]);
    expect(csv).toContain('"Hello, ""World"""');
    expect(csv).toContain('"Line\nbreak"');
    expect(csv).toContain("A Author; B Writer");
    expect(csv.split("\n").length).toBeGreaterThanOrEqual(2);
  });
});
