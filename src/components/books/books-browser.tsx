"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { BookCard } from "@/components/books/book-card";
import { BookDetailDialog } from "@/components/books/book-detail-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setVisibleCount(pageSize);
              syncUrl({ search: value });
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
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
            className="h-10 rounded-xl border border-ink/15 bg-paper px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("title")}
      >
        {FILTERS.map((filter) => {
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
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "bg-paper/80 text-ink-muted ring-1 ring-ink/10 hover:bg-blush/40 hover:text-ink",
              )}
            >
              {t(filter.labelKey)}
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
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((book) => (
              <li key={book.id}>
                <BookCard book={book} onSelect={setSelected} />
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
          <p className="mt-4 text-center text-sm text-ink-muted">
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
