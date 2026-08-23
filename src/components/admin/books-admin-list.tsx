"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Book, BookStatus } from "@/types/database";
import {
  archiveBook,
  bulkUpdateStatus,
  deleteBook,
  restoreBook,
} from "@/lib/actions/books";
import { downloadBooksCsv } from "@/lib/books/export-csv";
import { Link, useRouter } from "@/i18n/navigation";
import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

type BooksAdminListProps = {
  books: Book[];
  statusFilter: string;
};

const FILTERS = [
  "all",
  "candidate",
  "currently_reading",
  "previously_read",
  "archived",
] as const;

export function BooksAdminList({ books, statusFilter }: BooksAdminListProps) {
  const t = useTranslations("Admin");
  const tBooks = useTranslations("Books");
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (statusFilter === "all") {
      return books.filter((b) => !b.is_archived);
    }
    if (statusFilter === "archived") {
      return books.filter((b) => b.is_archived || b.status === "archived");
    }
    return books.filter((b) => b.status === statusFilter && !b.is_archived);
  }, [books, statusFilter]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    startTransition(() => {
      void (async () => {
        const result = await fn();
        if (!result.ok) {
          toast.error(result.error ?? t("toasts.error"));
          return;
        }
        toast.success(t("toasts.saved"));
        setSelected(new Set());
        router.refresh();
      })();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={
                f === "all" ? "/admin/books" : `/admin/books?status=${f}`
              }
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm",
                statusFilter === f
                  ? "bg-ink text-paper"
                  : "bg-ink/5 text-ink-muted hover:bg-ink/10",
              )}
            >
              {f === "all"
                ? tBooks("filters.all")
                : f === "currently_reading"
                  ? tBooks("filters.currentlyReading")
                  : f === "previously_read"
                    ? tBooks("filters.previouslyRead")
                    : f === "candidate"
                      ? tBooks("filters.candidate")
                      : tBooks("status.archived")}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadBooksCsv(filtered)}
          >
            <Download className="size-4" />
            {t("books.exportCsv")}
          </Button>
          <Button asChild>
            <Link href="/admin/books/new">{t("books.addBook")}</Link>
          </Button>
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm">
          <span>{t("forms.selectedCount", { count: selected.size })}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() =>
                bulkUpdateStatus([...selected], "candidate" as BookStatus),
              )
            }
          >
            → candidate
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() =>
                bulkUpdateStatus([...selected], "archived" as BookStatus),
              )
            }
          >
            {t("forms.archive")}
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-ink/8">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink/5 text-ink-muted">
            <tr>
              <th className="w-10 p-3">
                <Checkbox
                  checked={
                    filtered.length > 0 && selected.size === filtered.length
                  }
                  onCheckedChange={toggleAll}
                  aria-label={t("forms.selectAll")}
                />
              </th>
              <th className="p-3">{t("books.title")}</th>
              <th className="hidden p-3 md:table-cell">{t("books.authors")}</th>
              <th className="p-3">{t("books.status")}</th>
              <th className="p-3 text-right">{t("forms.bulkActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8 bg-paper">
            {filtered.map((book) => (
              <tr key={book.id}>
                <td className="p-3 align-middle">
                  <Checkbox
                    checked={selected.has(book.id)}
                    onCheckedChange={() => toggle(book.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 shrink-0">
                      <BookCover
                        src={book.cover_url}
                        alt={book.title}
                        title={book.title}
                        sizes="40px"
                      />
                    </div>
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="font-medium text-ink hover:underline"
                    >
                      {book.title}
                    </Link>
                  </div>
                </td>
                <td className="hidden p-3 text-ink-muted md:table-cell">
                  {book.authors.join(", ")}
                </td>
                <td className="p-3">
                  <BookStatusBadge status={book.status} />
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {book.is_archived || book.status === "archived" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => run(() => restoreBook(book.id))}
                      >
                        {t("forms.restore")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => run(() => archiveBook(book.id))}
                      >
                        {t("forms.archive")}
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" disabled={isPending}>
                          {t("forms.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("books.deleteBook")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("forms.confirmDelete")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("forms.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => run(() => deleteBook(book.id))}
                          >
                            {t("forms.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">
            {tBooks("empty")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
