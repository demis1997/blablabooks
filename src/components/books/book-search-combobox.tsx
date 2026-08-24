"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lockedTitle, setLockedTitle] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (q: string, pageNum: number, append: boolean, requestId: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(q)}&page=${pageNum}&limit=8`,
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
      if (requestId !== requestIdRef.current) return;

      setTotal(data.total);
      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(pageNum);
    },
    [],
  );

  const trimmedQuery = query.trim();
  const canSearch =
    trimmedQuery.length >= 2 && lockedTitle !== trimmedQuery;
  const visibleResults = canSearch ? results : [];
  const dropdownOpen = canSearch && menuOpen;
  const hasMore = canSearch && visibleResults.length < total;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!canSearch) {
      requestIdRef.current += 1;
      return;
    }

    const q = trimmedQuery;
    debounceRef.current = setTimeout(() => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      setLoading(true);
      setMenuOpen(true);
      setError(null);
      void (async () => {
        try {
          await fetchPage(q, 1, false, requestId);
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          if (requestId !== requestIdRef.current) return;
          setError(e instanceof Error ? e.message : "Search failed");
          setResults([]);
        } finally {
          if (requestId === requestIdRef.current) setLoading(false);
        }
      })();
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [canSearch, trimmedQuery, fetchPage]);

  const loadMore = async () => {
    if (!canSearch || loadingMore || disabled) return;
    setLoadingMore(true);
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    try {
      await fetchPage(trimmedQuery, page + 1, true, requestId);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "Search failed");
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const choose = (result: BookSearchResult) => {
    setLockedTitle(result.title);
    onSelect(result);
    setQuery(result.title);
    setResults([]);
    setError(null);
    setLoading(false);
    setMenuOpen(false);
  };

  return (
    <div className={cn("relative space-y-2", className)}>
      {labels.label ? (
        <label className="text-sm font-medium text-ink" htmlFor={listId}>
          {labels.label}
        </label>
      ) : null}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          id={listId}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => {
            setLockedTitle(null);
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (visibleResults[0]) choose(visibleResults[0]);
          }}
          placeholder={labels.placeholder}
          className="pl-9"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          disabled={disabled}
        />
        {canSearch && loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-muted" />
        ) : null}
      </div>

      {error && !dropdownOpen ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : null}

      {dropdownOpen ? (
        <div className="absolute z-20 mt-1 max-h-96 w-full overflow-auto rounded-2xl border border-ink/10 bg-paper shadow-soft">
          {error ? (
            <p className="p-4 text-sm text-red-700">{error}</p>
          ) : visibleResults.length === 0 && loading ? (
            <div className="space-y-2 p-4" aria-hidden>
              <div className="h-12 animate-pulse rounded-md bg-ink/5" />
              <div className="h-12 animate-pulse rounded-md bg-ink/5" />
              <div className="h-12 animate-pulse rounded-md bg-ink/5" />
            </div>
          ) : visibleResults.length === 0 && !loading ? (
            <p className="p-4 text-sm text-ink-muted">{labels.noResults}</p>
          ) : (
            <ul className="divide-y divide-ink/8">
              {visibleResults.map((result, idx) => (
                <li key={`${result.openLibraryWorkKey ?? result.title}-${idx}`}>
                  <button
                    type="button"
                    className="flex w-full gap-3 p-3 text-left transition-colors hover:bg-ink/5 disabled:opacity-60"
                    disabled={disabled}
                    onClick={() => choose(result)}
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
          {hasMore && !error ? (
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
