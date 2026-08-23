import { describe, expect, it } from "vitest";
import { applyDrawConfirmation } from "@/lib/books/draw-logic";
import { normalizeAuthors, normalizeTitle } from "@/lib/books/normalize";
import type { Book } from "@/types/database";

function makeBook(
  overrides: Partial<Book> & Pick<Book, "id" | "title" | "status">,
): Book {
  const authors = overrides.authors ?? ["Author"];
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

describe("applyDrawConfirmation", () => {
  it("moves previous current to previously_read and selected to currently_reading", () => {
    const books: Book[] = [
      makeBook({
        id: "current",
        title: "Old Current",
        status: "currently_reading",
        selected_month: 7,
        selected_year: 2026,
      }),
      makeBook({
        id: "picked",
        title: "New Pick",
        status: "candidate",
      }),
      makeBook({
        id: "other",
        title: "Other Candidate",
        status: "candidate",
      }),
    ];

    const { updatedBooks, previousCurrentId } = applyDrawConfirmation({
      books,
      selectedBookId: "picked",
      month: 8,
      year: 2026,
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(previousCurrentId).toBe("current");
    expect(updatedBooks.find((b) => b.id === "current")?.status).toBe(
      "previously_read",
    );
    const picked = updatedBooks.find((b) => b.id === "picked")!;
    expect(picked.status).toBe("currently_reading");
    expect(picked.selected_month).toBe(8);
    expect(picked.selected_year).toBe(2026);
    expect(updatedBooks.find((b) => b.id === "other")?.status).toBe(
      "candidate",
    );
  });

  it("handles no previous current book", () => {
    const books: Book[] = [
      makeBook({ id: "picked", title: "Only Pick", status: "candidate" }),
    ];
    const { previousCurrentId, updatedBooks } = applyDrawConfirmation({
      books,
      selectedBookId: "picked",
      month: 9,
      year: 2026,
    });
    expect(previousCurrentId).toBeNull();
    expect(updatedBooks[0]?.status).toBe("currently_reading");
  });
});
