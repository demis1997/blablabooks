import type { Book } from "@/types/database";

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function booksToCsv(books: Book[]): string {
  const headers = [
    "title",
    "subtitle",
    "authors",
    "page_count",
    "status",
    "isbn_13",
    "isbn_10",
    "language",
    "first_publish_year",
    "selected_month",
    "selected_year",
    "open_library_work_key",
    "cover_url",
    "club_note",
    "date_added",
  ];

  const rows = books.map((book) =>
    [
      book.title,
      book.subtitle,
      book.authors.join("; "),
      book.page_count,
      book.status,
      book.isbn_13,
      book.isbn_10,
      book.language,
      book.first_publish_year,
      book.selected_month,
      book.selected_year,
      book.open_library_work_key,
      book.cover_url,
      book.club_note,
      book.date_added,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadBooksCsv(books: Book[], filename = "blabla-books.csv") {
  const csv = booksToCsv(books);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
