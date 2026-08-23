import { describe, expect, it } from "vitest";
import {
  buildNormalizedKey,
  normalizeAuthors,
  normalizeTitle,
} from "@/lib/books/normalize";

describe("normalizeTitle", () => {
  it("lowercases and trims", () => {
    expect(normalizeTitle("  The Midnight Library  ")).toBe(
      "the midnight library",
    );
  });

  it("collapses whitespace and strips punctuation", () => {
    expect(normalizeTitle("Atomic Habits: An Easy Way!")).toBe(
      "atomic habits an easy way",
    );
  });

  it("strips diacritics", () => {
    expect(normalizeTitle("Café Résumé")).toBe("cafe resume");
  });
});

describe("normalizeAuthors", () => {
  it("normalizes, sorts, and joins authors", () => {
    expect(normalizeAuthors(["James Clear", "Andy Weir"])).toBe(
      "andy weir | james clear",
    );
  });

  it("drops empty author strings", () => {
    expect(normalizeAuthors(["", "  Jane Austen  ", ""])).toBe("jane austen");
  });
});

describe("buildNormalizedKey", () => {
  it("joins normalized title and authors", () => {
    expect(buildNormalizedKey("1984", ["George Orwell"])).toBe(
      "1984::george orwell",
    );
  });

  it("is stable regardless of author order", () => {
    const a = buildNormalizedKey("Co-authored", ["B Author", "A Author"]);
    const b = buildNormalizedKey("Co-authored", ["A Author", "B Author"]);
    expect(a).toBe(b);
  });
});
