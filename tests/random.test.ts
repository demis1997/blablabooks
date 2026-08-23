import { afterEach, describe, expect, it, vi } from "vitest";
import {
  filterEligibleCandidates,
  pickRandomBookId,
  secureRandomIndex,
} from "@/lib/books/random";
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pickRandomBookId", () => {
  it("returns null for an empty pool", () => {
    expect(pickRandomBookId([])).toBeNull();
  });

  it("returns one of the eligible ids", () => {
    const ids = ["a", "b", "c"];
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(
      ((arr: Uint32Array) => {
        arr[0] = 1;
        return arr;
      }) as typeof crypto.getRandomValues,
    );
    const picked = pickRandomBookId(ids);
    expect(ids).toContain(picked);
    expect(picked).toBe("b");
  });
});

describe("filterEligibleCandidates", () => {
  const books: Book[] = [
    makeBook({ id: "c1", title: "Candidate One", status: "candidate" }),
    makeBook({ id: "c2", title: "Candidate Two", status: "candidate" }),
    makeBook({
      id: "archived",
      title: "Archived Candidate",
      status: "candidate",
      is_archived: true,
    }),
    makeBook({
      id: "reading",
      title: "Currently Reading",
      status: "currently_reading",
    }),
  ];

  it("excludes archived, non-candidate, and excluded ids", () => {
    const eligible = filterEligibleCandidates(books, ["c2"]);
    expect(eligible.map((b) => b.id)).toEqual(["c1"]);
  });
});

describe("secureRandomIndex", () => {
  it("returns an index within bounds", () => {
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(
      ((arr: Uint32Array) => {
        arr[0] = 7;
        return arr;
      }) as typeof crypto.getRandomValues,
    );
    expect(secureRandomIndex(5)).toBe(2);
  });

  it("rejects non-positive lengths", () => {
    expect(() => secureRandomIndex(0)).toThrow(RangeError);
    expect(() => secureRandomIndex(-1)).toThrow(RangeError);
  });
});
