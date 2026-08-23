import { afterEach, describe, expect, it, vi } from "vitest";
import { searchBooks, validateSearchQuery } from "@/lib/books/search";

vi.mock("@/lib/books/open-library", () => ({
  searchOpenLibrary: vi.fn(async () => ({
    results: [{ title: "Mock", authors: ["A"] }],
    total: 1,
  })),
  enrichWithPageCount: vi.fn(async (result: unknown) => result),
}));

vi.mock("@/lib/books/google-books", () => ({
  searchGoogleBooks: vi.fn(async () => []),
  getGoogleBooksPageCount: vi.fn(async () => null),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("validateSearchQuery", () => {
  it("rejects queries shorter than 2 characters after trim", () => {
    expect(validateSearchQuery("")).toBeNull();
    expect(validateSearchQuery(" a ")).toBeNull();
  });

  it("trims and accepts valid queries", () => {
    expect(validateSearchQuery("  hi  ")).toBe("hi");
  });
});

describe("searchBooks", () => {
  it("returns empty without calling Open Library for short queries", async () => {
    const { searchOpenLibrary } = await import("@/lib/books/open-library");
    const result = await searchBooks("x");
    expect(result).toEqual({ results: [], total: 0 });
    expect(searchOpenLibrary).not.toHaveBeenCalled();
  });

  it("trims whitespace before searching", async () => {
    const { searchOpenLibrary } = await import("@/lib/books/open-library");
    await searchBooks("  dune  ", { enrichPageCount: false, includeGoogleFallback: false });
    expect(searchOpenLibrary).toHaveBeenCalledWith("dune", expect.any(Object));
  });
});
