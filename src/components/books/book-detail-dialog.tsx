"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Book } from "@/types/database";
import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface BookDetailDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}

export function BookDetailDialog({
  book,
  open,
  onOpenChange,
}: BookDetailDialogProps) {
  const t = useTranslations("Books");
  const locale = useLocale();

  if (!book) return null;

  const description =
    locale === "ru" && book.description_ru
      ? book.description_ru
      : book.description;
  const clubNote =
    locale === "ru" && book.club_note_ru ? book.club_note_ru : book.club_note;

  const selected =
    book.selected_month && book.selected_year
      ? new Intl.DateTimeFormat(locale, {
          month: "long",
          year: "numeric",
        }).format(new Date(book.selected_year, book.selected_month - 1, 1))
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="grid gap-6 p-6 sm:grid-cols-[140px_1fr]">
            <BookCover
              src={book.cover_url}
              alt={book.title}
              title={book.title}
              sizes="140px"
              className="mx-auto w-[120px] sm:mx-0 sm:w-full"
            />
            <div className="min-w-0 space-y-4">
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                {t("catalogueKicker")}
              </p>
              <DialogHeader className="space-y-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <BookStatusBadge status={book.status} />
                  {selected ? (
                    <Badge variant="outline">{selected}</Badge>
                  ) : null}
                </div>
                <DialogTitle className="text-2xl">{book.title}</DialogTitle>
                {book.subtitle ? (
                  <DialogDescription className="text-base">
                    {book.subtitle}
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">
                    {book.authors.join(", ")}
                  </DialogDescription>
                )}
              </DialogHeader>

              <dl className="space-y-3">
                <DetailRow
                  label={t("details.authors")}
                  value={book.authors.join(", ")}
                />
                <DetailRow
                  label={t("details.pages")}
                  value={book.page_count}
                />
                <DetailRow
                  label={t("details.published")}
                  value={
                    book.edition_publish_year ?? book.first_publish_year
                  }
                />
                <DetailRow
                  label={t("details.language")}
                  value={book.language}
                />
                <DetailRow
                  label={t("details.isbn")}
                  value={book.isbn_13 ?? book.isbn_10}
                />
                <DetailRow label={t("details.selectedFor")} value={selected} />
                <DetailRow
                  label={t("details.dateAdded")}
                  value={book.date_added}
                />
              </dl>

              {book.subjects.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {t("details.subjects")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {book.subjects.slice(0, 8).map((subject) => (
                      <Badge key={subject} variant="muted">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {description ? (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                      {t("details.description")}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {description}
                    </p>
                  </div>
                </>
              ) : null}

              {clubNote ? (
                <div className="rounded-xl bg-butter/40 px-3 py-2.5 text-sm text-ink">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {t("details.clubNote")}
                  </p>
                  {clubNote}
                </div>
              ) : null}

              {book.open_library_work_key ? (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`https://openlibrary.org${book.open_library_work_key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("openLibrary")}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
