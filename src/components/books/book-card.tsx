"use client";

import type { Book } from "@/types/database";
import { cn } from "@/lib/utils";
import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { Card, CardContent } from "@/components/ui/card";

interface BookCardProps {
  book: Book;
  pagesLabel?: string;
  className?: string;
  onSelect?: (book: Book) => void;
}

function formatMonthYear(month: number | null, year: number | null) {
  if (!month || !year) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  } catch {
    return `${month}/${year}`;
  }
}

export function BookCard({
  book,
  pagesLabel,
  className,
  onSelect,
}: BookCardProps) {
  const authors = book.authors.join(", ");
  const period = formatMonthYear(book.selected_month, book.selected_year);
  const interactive = Boolean(onSelect);

  const content = (
    <>
      <BookCover
        src={book.cover_url}
        alt={book.title}
        title={book.title}
        className="w-full"
      />
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-start gap-2">
          <BookStatusBadge status={book.status} />
          {period ? (
            <span className="text-xs text-ink-muted">{period}</span>
          ) : null}
        </div>
        <h3 className="font-display text-base font-semibold leading-snug text-ink line-clamp-2">
          {book.title}
        </h3>
        {authors ? (
          <p className="text-sm text-ink-muted line-clamp-1">{authors}</p>
        ) : null}
        {book.page_count != null ? (
          <p className="mt-auto pt-1 text-xs text-ink-muted">
            {pagesLabel ?? `${book.page_count} pages`}
          </p>
        ) : null}
      </CardContent>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(book)}
        className={cn(
          "group w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          className,
        )}
      >
        <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-[0_10px_28px_rgb(48_44_53_/_0.08)]">
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Card className={cn("h-full overflow-hidden", className)}>{content}</Card>
  );
}
