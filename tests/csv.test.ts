import { describe, expect, it } from "vitest";
import {
  normalizeImportedStatus,
  parseCsv,
  suggestColumnMapping,
} from "@/lib/books/csv";

describe("parseCsv", () => {
  it("parses a simple matrix including headers", () => {
    const rows = parseCsv(
      "Title,Author,Pages\nAtomic Habits,James Clear,320\n",
    );
    expect(rows).toEqual([
      ["Title", "Author", "Pages"],
      ["Atomic Habits", "James Clear", "320"],
    ]);
  });

  it("trims cells and skips empty lines", () => {
    const rows = parseCsv("Title,Author\n  1984 , George Orwell \n\n");
    expect(rows).toEqual([
      ["Title", "Author"],
      ["1984", "George Orwell"],
    ]);
  });
});

describe("suggestColumnMapping", () => {
  it("maps English and Russian header aliases", () => {
    expect(
      suggestColumnMapping(["Название", "Автор", "Pages", "Status", "Notes"]),
    ).toEqual({
      Название: "title",
      Автор: "author",
      Pages: "page_count",
      Status: "status",
      Notes: "notes",
    });
  });

  it("ignores unknown headers", () => {
    expect(suggestColumnMapping(["ISBN", "Title"])).toEqual({
      Title: "title",
    });
  });
});

describe("normalizeImportedStatus", () => {
  it("maps common aliases", () => {
    expect(normalizeImportedStatus("to read")).toBe("candidate");
    expect(normalizeImportedStatus("Currently Reading")).toBe(
      "currently_reading",
    );
    expect(normalizeImportedStatus("finished")).toBe("previously_read");
    expect(normalizeImportedStatus("archive")).toBe("archived");
  });

  it("returns null for blank or unknown values", () => {
    expect(normalizeImportedStatus("")).toBeNull();
    expect(normalizeImportedStatus("wishlisted-maybe")).toBeNull();
  });
});
