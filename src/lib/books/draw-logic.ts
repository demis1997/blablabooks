import type { Book } from "@/types/database";

/**
 * Pure status transitions when a monthly draw is confirmed:
 * - previous currently_reading → previously_read
 * - selected candidate → currently_reading (with month/year)
 */
export function applyDrawConfirmation(args: {
  books: Book[];
  selectedBookId: string;
  month: number;
  year: number;
  now?: string;
}): { updatedBooks: Book[]; previousCurrentId: string | null } {
  const now = args.now ?? new Date().toISOString();
  let previousCurrentId: string | null = null;

  const updatedBooks = args.books.map((book) => {
    if (book.status === "currently_reading" && !book.is_archived) {
      previousCurrentId = book.id;
      if (book.id === args.selectedBookId) {
        return {
          ...book,
          status: "currently_reading" as const,
          selected_month: args.month,
          selected_year: args.year,
          updated_at: now,
        };
      }
      return {
        ...book,
        status: "previously_read" as const,
        updated_at: now,
      };
    }

    if (book.id === args.selectedBookId) {
      return {
        ...book,
        status: "currently_reading" as const,
        selected_month: args.month,
        selected_year: args.year,
        updated_at: now,
      };
    }

    return book;
  });

  return { updatedBooks, previousCurrentId };
}
