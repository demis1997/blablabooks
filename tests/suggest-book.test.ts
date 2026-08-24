import { describe, expect, it } from "vitest";
import {
  duplicateSuggestCode,
  optionalHttpUrl,
  searchResultToCandidateInput,
} from "@/lib/books/suggest";
import { normalizeAuthors, normalizeTitle } from "@/lib/books/normalize";
import type { Book, BookSearchResult } from "@/types/database";

function makeBook(overrides: Partial<Book> & Pick<Book, "id" | "title">): Book {
  const authors = overrides.authors ?? ["Unknown"];
  return {
    subtitle: null,
    authors,
    page_count: null,
    description: null,
    description_ru: null,
    isbn_10: null,
    isbn_13: null,
    first_publish_year: null,
    edition_publish_year: null,
    language: null,
    subjects: [],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: null,
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    normalized_title: normalizeTitle(overrides.title),
    normalized_authors: normalizeAuthors(authors),
    is_archived: false,
    date_added: "2026-01-01",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: null,
    ...overrides,
  };
}

const result: BookSearchResult = {
  title: "  Poor Things  ",
  authors: ["  Alasdair Gray  "],
  coverUrl: "https://covers.openlibrary.org/b/id/1-L.jpg",
  provider: "open_library",
};

describe("public randomizer suggestions", () => {
  it("maps a search hit to a candidate book", () => {
    const input = searchResultToCandidateInput(result);
    expect(input.title).toBe("Poor Things");
    expect(input.authors).toEqual(["Alasdair Gray"]);
    expect(input.status).toBe("candidate");
    expect(input.cover_url).toContain("openlibrary.org");
  });

  it("falls back to Unknown when authors are missing", () => {
    const input = searchResultToCandidateInput({
      ...result,
      authors: [],
    });
    expect(input.authors).toEqual(["Unknown"]);
  });

  it("drops invalid cover URLs", () => {
    expect(optionalHttpUrl("not-a-url")).toBeNull();
    expect(optionalHttpUrl("https://example.com/cover.jpg")).toBe(
      "https://example.com/cover.jpg",
    );
  });

  it("classifies duplicates by club status", () => {
    expect(
      duplicateSuggestCode(makeBook({ id: "1", title: "A", status: "candidate" })),
    ).toBe("already_in_pool");
    expect(
      duplicateSuggestCode(
        makeBook({ id: "2", title: "B", status: "currently_reading" }),
      ),
    ).toBe("already_current");
    expect(
      duplicateSuggestCode(
        makeBook({ id: "3", title: "C", status: "previously_read" }),
      ),
    ).toBe("already_read");
    expect(
      duplicateSuggestCode(
        makeBook({ id: "4", title: "D", status: "archived", is_archived: true }),
      ),
    ).toBe("restore_archived");
  });
});
