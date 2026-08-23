"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { BookCard } from "@/components/books/book-card";
import { BookDetailDialog } from "@/components/books/book-detail-dialog";
import { PaperCard } from "@/components/book/paper-card";
import { PaperTexture } from "@/components/book/paper-texture";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Book, BookStatus } from "@/types/database";
import type { BookSort } from "@/lib/data/books";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ value: "" | BookStatus; labelKey: string }> = [
  { value: "", labelKey: "filters.all" },
  { value: "candidate", labelKey: "filters.candidate" },
  { value: "currently_reading", labelKey: "filters.currentlyReading" },
  { value: "previously_read", labelKey: "filters.previouslyRead" },
];

const SORTS: Array<{ value: BookSort; labelKey: string }> = [
  { value: "date_added", labelKey: "sorts.dateAdded" },
  { value: "title", labelKey: "sorts.title" },
  { value: "author", labelKey: "sorts.author" },
  { value: "page_count", labelKey: "sorts.pageCount" },
];

const FILTER_ROTATES = [-1.2, 0.8, -0.6, 1.1] as const;

export type BooksBrowserProps = {
  initialBooks: Book[];
  total: number;
  pageSize: number;
  initialSearch?: string;
  initialStatus?: BookStatus | "";
  initialSort?: BookSort;
};

export function BooksBrowser({
  initialBooks,
  total,
  pageSize,
  initialSearch = "",
  initialStatus = "",
  initialSort = "date_added",
}: BooksBrowserProps) {
  const t = useTranslations("Books");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<BookStatus | "">(initialStatus);
  const [sort, setSort] = useState<BookSort>(initialSort);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selected, setSelected] = useState<Book | null>(null);
  const books = initialBooks;

  const syncUrl = (
    next: Partial<{
      search: string;
      status: BookStatus | "";
      sort: BookSort;
    }>,
  ) => {
    const params = new URLSearchParams();
    const q = next.search ?? search;
    const st = next.status ?? status;
    const so = next.sort ?? sort;
    if (q.trim()) params.set("q", q.trim());
    if (st) params.set("status", st);
    if (so && so !== "date_added") params.set("sort", so);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const filtered = useMemo(() => {
    let list = [...books];
    if (status) {
      list = list.filter((b) => b.status === status);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q)),
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return (a.authors[0] ?? "").localeCompare(b.authors[0] ?? "");
        case "page_count":
          return (a.page_count ?? 0) - (b.page_count ?? 0);
        case "date_added":
        default:
          return b.date_added.localeCompare(a.date_added);
      }
    });
    return list;
  }, [books, search, sort, status]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className={cn(isPending && "opacity-80 transition-opacity")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* catalogue search slip */}
        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-ink/12 bg-paper shadow-[var(--shadow-soft)]">
          <PaperTexture className="opacity-[0.035]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blush/70 via-powder/50 to-sage/60"
          />
          <div className="relative z-[1] flex items-center gap-2 px-3 py-2.5 pl-4">
            <Search
              className="h-4 w-4 shrink-0 text-ink-muted"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                setVisibleCount(pageSize);
                syncUrl({ search: value });
              }}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="w-full bg-transparent font-display text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="books-sort">
            {t("sortBy")}
          </label>
          <select
            id="books-sort"
            value={sort}
            onChange={(e) => {
              const value = e.target.value as BookSort;
              setSort(value);
              syncUrl({ sort: value });
            }}
            className="h-10 rounded-lg border border-ink/15 bg-paper px-3 font-display text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* library index-card filters */}
      <div
        className="mt-5 flex flex-wrap gap-2.5"
        role="tablist"
        aria-label={t("title")}
      >
        {FILTERS.map((filter, i) => {
          const active = status === filter.value;
          return (
            <button
              key={filter.labelKey}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setStatus(filter.value);
                setVisibleCount(pageSize);
                syncUrl({ status: filter.value });
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <PaperCard
                rotate={FILTER_ROTATES[i % FILTER_ROTATES.length]}
                className={cn(
                  "rounded-md px-3.5 py-1.5 transition-shadow",
                  active
                    ? "bg-ink text-paper shadow-md ring-1 ring-ink/20"
                    : "hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "font-display text-sm tracking-wide",
                    active ? "text-paper" : "text-ink-muted",
                  )}
                >
                  {t(filter.labelKey)}
                </span>
              </PaperCard>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={t("empty")} />
        </div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((book, i) => (
              <li key={book.id}>
                <BookCard
                  book={book}
                  onSelect={setSelected}
                  index={i}
                />
              </li>
            ))}
          </ul>
          {hasMore ? (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + pageSize)}
              >
                {t("loadMore")}
              </Button>
            </div>
          ) : null}
          <p className="mt-4 text-center font-display text-sm text-ink-muted">
            {visible.length} / {filtered.length || total}
          </p>
        </>
      )}

      <BookDetailDialog
        book={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
