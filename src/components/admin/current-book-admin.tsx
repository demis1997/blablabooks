"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Book } from "@/types/database";
import {
  clearCurrentBook,
  markAsRead,
  setCurrentBook,
} from "@/lib/actions/books";
import { BookCover } from "@/components/books/book-cover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

type CurrentBookAdminProps = {
  current: Book | null;
  candidates: Book[];
};

export function CurrentBookAdmin({
  current,
  candidates,
}: CurrentBookAdminProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    startTransition(() => {
      void (async () => {
        const result = await fn();
        if (!result.ok) {
          toast.error(result.error ?? t("toasts.error"));
          return;
        }
        toast.success(t("toasts.saved"));
        router.refresh();
      })();
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-ink/8 bg-paper p-6">
        <h2 className="font-display text-xl text-ink">
          {t("currentBook.title")}
        </h2>
        {current ? (
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="w-28">
              <BookCover
                src={current.cover_url}
                alt={current.title}
                title={current.title}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="font-display text-2xl text-ink">{current.title}</p>
                <p className="text-ink-muted">{current.authors.join(", ")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => run(() => markAsRead(current.id))}
                >
                  {t("currentBook.markPreviouslyRead")}
                </Button>
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => run(() => clearCurrentBook())}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">{t("currentBook.none")}</p>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-ink/8 bg-paper p-6">
        <h2 className="font-display text-xl text-ink">
          {t("currentBook.setCurrent")}
        </h2>
        {candidates.length === 0 ? (
          <p className="text-sm text-ink-muted">No candidates available.</p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={!selectedId || isPending}
              onClick={() => run(() => setCurrentBook(selectedId))}
            >
              {t("currentBook.setCurrent")}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
