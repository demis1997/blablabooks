"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Book, BookStatus } from "@/types/database";
import { cn } from "@/lib/utils";
import { BookCover3D } from "@/components/book/book-cover-3d";
import { StampBadge } from "@/components/book/stamp-badge";
import { PaperTexture } from "@/components/book/paper-texture";
import { BookCover } from "@/components/books/book-cover";
import { motionTokens } from "@/lib/motion/tokens";

interface BookCardProps {
  book: Book;
  pagesLabel?: string;
  className?: string;
  onSelect?: (book: Book) => void;
  /** Stagger index for entrance (clamped by parent; 0–7 recommended). */
  index?: number;
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

const STATUS_TONE: Record<
  BookStatus,
  "blush" | "powder" | "sage" | "butter"
> = {
  candidate: "powder",
  currently_reading: "blush",
  previously_read: "sage",
  archived: "butter",
};

export function BookCard({
  book,
  pagesLabel,
  className,
  onSelect,
  index = 0,
}: BookCardProps) {
  const t = useTranslations("Books.status");
  const reduceMotion = useReducedMotion();
  const authors = book.authors.join(", ");
  const period = formatMonthYear(book.selected_month, book.selected_year);
  const interactive = Boolean(onSelect);
  const stagger = Math.min(index, 7);
  const showRibbon = book.status === "currently_reading";

  const cover = book.cover_url ? (
    <BookCover3D
      src={book.cover_url}
      alt={book.title}
      title={book.title}
      className="w-full"
    />
  ) : (
    <BookCover
      src={book.cover_url}
      alt={book.title}
      title={book.title}
      className="w-full"
    />
  );

  const content = (
    <>
      <div className="relative px-2 pt-2">
        {cover}
        {showRibbon ? (
          <span
            className="bookmark-ribbon pointer-events-none absolute right-5 top-2 z-10 h-1 w-4"
            title={t("currently_reading")}
            aria-label={t("currently_reading")}
          />
        ) : (
          <div className="absolute left-3 top-4 z-10">
            <StampBadge
              tone={STATUS_TONE[book.status]}
              className="rotate-[-6deg] text-[10px] shadow-md"
            >
              {t(book.status)}
            </StampBadge>
          </div>
        )}
      </div>

      {/* catalogue paper slip */}
      <div className="relative mx-1 mb-1 mt-2 overflow-hidden rounded-md border border-ink/10 bg-paper px-3 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]">
        <PaperTexture className="opacity-[0.03]" />
        <div className="relative z-[1]">
          {period ? (
            <p className="text-[10px] uppercase tracking-wider text-ink-muted">
              {period}
            </p>
          ) : null}
          <h3 className="mt-0.5 font-display text-sm font-semibold leading-snug text-ink line-clamp-2">
            {book.title}
          </h3>
          {authors ? (
            <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">
              {authors}
            </p>
          ) : null}
          {book.page_count != null ? (
            <p className="mt-1 text-[10px] text-ink-muted">
              {pagesLabel ?? `${book.page_count} pages`}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.paper,
          delay: stagger * motionTokens.stagger,
        },
      };

  if (interactive) {
    return (
      <motion.button
        type="button"
        onClick={() => onSelect?.(book)}
        className={cn(
          "group w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          className,
        )}
        {...motionProps}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div className={cn("h-full", className)} {...motionProps}>
      {content}
    </motion.div>
  );
}
