import { describe, expect, it } from "vitest";
import {
  findDuplicateMatches,
  findDuplicatesByTitleAuthor,
} from "@/lib/books/duplicates";
import { normalizeAuthors, normalizeTitle } from "@/lib/books/normalize";
import type { Book } from "@/types/database";

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

const existing: Book[] = [
  makeBook({
    id: "book-1",
    title: "Atomic Habits",
    authors: ["James Clear"],
    isbn_13: "9780735211292",
    isbn_10: "0735211299",
    open_library_work_key: "/works/OL19964198W",
  }),
  makeBook({
    id: "book-2",
    title: "Project Hail Mary",
    authors: ["Andy Weir"],
    open_library_work_key: "/works/OL21637224W",
  }),
];

describe("findDuplicateMatches", () => {
  it("matches by ISBN-13", () => {
    const matches = findDuplicateMatches(existing, {
      isbn_13: "9780735211292",
      title: "Different Title",
      authors: ["Someone Else"],
    });
    expect(matches.map((b) => b.id)).toEqual(["book-1"]);
  });

  it("matches by Open Library work key", () => {
    const matches = findDuplicateMatches(existing, {
      open_library_work_key: "/works/OL21637224W",
      title: "Unrelated",
      authors: ["X"],
    });
    expect(matches.map((b) => b.id)).toEqual(["book-2"]);
  });

  it("matches by normalized title + authors", () => {
    const matches = findDuplicatesByTitleAuthor(
      existing,
      "atomic habits!",
      ["James Clear"],
    );
    expect(matches.map((b) => b.id)).toEqual(["book-1"]);
  });

  it("does not false-positive on similar but different titles", () => {
    const matches = findDuplicateMatches(existing, {
      title: "Atomic Habits Workbook",
      authors: ["James Clear"],
    });
    expect(matches).toHaveLength(0);
  });
});
