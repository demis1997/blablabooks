"use client";

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LivePreview } from "@/components/admin/live-preview";
import { Link, useRouter } from "@/i18n/navigation";

type CurrentBookAdminProps = {
  current: Book | null;
  candidates: Book[];
  previouslyRead: Book[];
};

export function CurrentBookAdmin({
  current,
  candidates,
  previouslyRead,
}: CurrentBookAdminProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const now = new Date();
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? "");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected = candidates.find((b) => b.id === selectedId) ?? null;

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
                <p className="text-sm text-ink-muted">
                  {current.page_count ? `${current.page_count} pages` : null}
                  {current.selected_month && current.selected_year
                    ? ` · ${current.selected_month}/${current.selected_year}`
                    : null}
                </p>
                {current.club_note ? (
                  <p className="mt-2 text-sm">{current.club_note}</p>
                ) : null}
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
                  onClick={() => setReplaceOpen(true)}
                >
                  {t("currentBook.replace")}
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
        <p className="text-sm text-ink-muted">{t("currentBook.methods")}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/randomizer">{t("currentBook.openRandomizer")}</Link>
        </Button>
        {candidates.length === 0 ? (
          <p className="text-sm text-ink-muted">No candidates available.</p>
        ) : (
          <div className="space-y-3">
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>{t("randomizer.month")}</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("randomizer.year")}</Label>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
            </div>
            {selected ? (
              <LivePreview
                english={
                  <div>
                    <p className="text-xs uppercase tracking-wider">
                      Currently reading
                    </p>
                    <p className="font-display text-xl">{selected.title}</p>
                    <p className="text-ink-muted">
                      {selected.authors.join(", ")}
                    </p>
                  </div>
                }
                russian={
                  <div>
                    <p className="text-xs uppercase tracking-wider">
                      Сейчас читаем
                    </p>
                    <p className="font-display text-xl">{selected.title}</p>
                    <p className="text-ink-muted">
                      {selected.authors.join(", ")}
                    </p>
                  </div>
                }
              />
            ) : null}
            <Button
              disabled={!selectedId || isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {t("currentBook.setCurrent")}
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-ink/8 bg-paper p-6">
        <h2 className="font-display text-xl text-ink">
          {t("currentBook.previous")}
        </h2>
        <ul className="mt-3 space-y-2">
          {previouslyRead.length === 0 ? (
            <li className="text-sm text-ink-muted">—</li>
          ) : (
            previouslyRead.slice(0, 12).map((book) => (
              <li key={book.id} className="text-sm">
                {book.title}
                {book.selected_month && book.selected_year
                  ? ` · ${book.selected_month}/${book.selected_year}`
                  : ""}
              </li>
            ))
          )}
        </ul>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("currentBook.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("currentBook.confirmBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("forms.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                run(() => setCurrentBook(selectedId, month, year));
              }}
            >
              {t("currentBook.setCurrent")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("currentBook.replace")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("currentBook.replaceBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("forms.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReplaceOpen(false);
                run(() => clearCurrentBook());
              }}
            >
              {t("currentBook.replace")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
