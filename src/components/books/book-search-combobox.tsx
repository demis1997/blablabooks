"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import type { BookSearchResult } from "@/types/database";
import { BookCover } from "@/components/books/book-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BookSearchComboboxLabels = {
  label?: string;
  placeholder: string;
  noResults: string;
  loadMore: string;
};

type BookSearchComboboxProps = {
  onSelect: (result: BookSearchResult) => void;
  labels: BookSearchComboboxLabels;
  className?: string;
  disabled?: boolean;
};

export function BookSearchCombobox({
  onSelect,
  labels,
  className,
  disabled = false,
}: BookSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (q: string, pageNum: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(q)}&page=${pageNum}&limit=12`,
        { signal: controller.signal },
      );
      const data = (await res.json()) as {
        results: BookSearchResult[];
        total: number;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      setTotal(data.total);
      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(pageNum);
      setOpen(true);
    },
    [],
  );

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;
  const visibleResults = canSearch ? results : [];
  const dropdownOpen = canSearch && open;
  const hasMore = canSearch && visibleResults.length < total;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!canSearch) {
      abortRef.current?.abort();
      return;
    }

    const q = trimmedQuery;
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        void (async () => {
          try {
            setError(null);
            await fetchPage(q, 1, false);
          } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return;
            setError(e instanceof Error ? e.message : "Search failed");
            setResults([]);
          }
        })();
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [canSearch, trimmedQuery, fetchPage]);

  const loadMore = async () => {
    if (!canSearch || loadingMore || disabled) return;
    setLoadingMore(true);
    try {
      await fetchPage(trimmedQuery, page + 1, true);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "Search failed");
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={cn("relative space-y-2", className)}>
      {labels.label ? (
        <label className="text-sm font-medium text-ink">{labels.label}</label>
      ) : null}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          className="pl-9"
          autoComplete="off"
          disabled={disabled}
        />
        {isPending ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-muted" />
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {dropdownOpen ? (
        <div className="z-20 max-h-96 overflow-auto rounded-2xl border border-ink/10 bg-paper shadow-soft">
          {visibleResults.length === 0 && !isPending ? (
            <p className="p-4 text-sm text-ink-muted">{labels.noResults}</p>
          ) : (
            <ul className="divide-y divide-ink/8">
              {visibleResults.map((result, idx) => (
                <li key={`${result.openLibraryWorkKey ?? result.title}-${idx}`}>
                  <button
                    type="button"
                    className="flex w-full gap-3 p-3 text-left transition-colors hover:bg-ink/5 disabled:opacity-60"
                    disabled={disabled}
                    onClick={() => {
                      onSelect(result);
                      setOpen(false);
                      setQuery(result.title);
                    }}
                  >
                    <div className="w-12 shrink-0">
                      <BookCover
                        src={result.coverUrl}
                        alt={result.title}
                        title={result.title}
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {result.title}
                      </p>
                      <p className="truncate text-sm text-ink-muted">
                        {result.authors.join(", ") || "—"}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {[
                          result.firstPublishYear,
                          result.pageCount
                            ? `${result.pageCount} pages`
                            : null,
                          result.language,
                          result.isbn13 || result.isbn10,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hasMore ? (
            <div className="border-t border-ink/8 p-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => void loadMore()}
                disabled={loadingMore || disabled}
              >
                {loadingMore ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {labels.loadMore}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
