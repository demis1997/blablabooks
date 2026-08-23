"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Book, MonthlyDraw } from "@/types/database";
import { pickDraw, confirmDraw } from "@/lib/actions/draws";
import { RandomizerExperience } from "@/components/randomizer/randomizer-experience";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/books/book-cover";
import { useRouter } from "@/i18n/navigation";

type AdminRandomizerProps = {
  candidates: Book[];
  history: MonthlyDraw[];
};

export function AdminRandomizerClient({
  candidates,
  history,
}: AdminRandomizerProps) {
  const t = useTranslations("Admin.randomizer");
  const tToast = useTranslations("Admin.toasts");
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [previewDrawId, setPreviewDrawId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const eligible = useMemo(
    () => candidates.filter((b) => !excluded.has(b.id)),
    [candidates, excluded],
  );

  const toggleExclude = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="month">{t("month")}</Label>
          <Input
            id="month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year">{t("year")}</Label>
          <Input
            id="year"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl text-ink">{t("eligible")}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {eligible.length} / {candidates.length}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {candidates.map((book) => {
            const isExcluded = excluded.has(book.id);
            return (
              <li
                key={book.id}
                className="flex items-center gap-3 rounded-xl border border-ink/8 bg-paper p-3"
              >
                <Checkbox
                  checked={isExcluded}
                  onCheckedChange={() => toggleExclude(book.id)}
                  id={`ex-${book.id}`}
                />
                <div className="w-8 shrink-0">
                  <BookCover
                    src={book.cover_url}
                    alt={book.title}
                    title={book.title}
                    sizes="32px"
                  />
                </div>
                <Label
                  htmlFor={`ex-${book.id}`}
                  className="min-w-0 flex-1 cursor-pointer font-normal"
                >
                  <span className="block truncate font-medium">{book.title}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {isExcluded ? t("excluded") : book.authors.join(", ")}
                  </span>
                </Label>
              </li>
            );
          })}
        </ul>
        {candidates.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">{t("noEligible")}</p>
        ) : null}
      </section>

      <RandomizerExperience
        eligibleBooks={eligible}
        displayOnly={false}
        onDraw={async () => {
          const result = await pickDraw({
            month,
            year,
            excluded_book_ids: [...excluded],
            notes: notes || null,
          });
          if (!result.ok || !result.data) {
            toast.error(result.error ?? tToast("error"));
            return null;
          }
          setPreviewDrawId(result.data.draw.id);
          return result.data.book;
        }}
        onConfirm={(book) => {
          if (!previewDrawId) {
            toast.error(tToast("error"));
            return;
          }
          startTransition(() => {
            void (async () => {
              const result = await confirmDraw({
                draw_id: previewDrawId,
                selected_book_id: book.id,
                month,
                year,
                notes: notes || null,
                excluded_book_ids: [...excluded],
                eligible_book_ids: eligible.map((b) => b.id),
              });
              if (!result.ok) {
                toast.error(result.error ?? tToast("error"));
                return;
              }
              toast.success(tToast("drawConfirmed"));
              setPreviewDrawId(null);
              router.refresh();
            })();
          });
        }}
      />

      {isPending ? (
        <p className="text-center text-sm text-ink-muted">…</p>
      ) : null}

      <section>
        <h2 className="font-display text-xl text-ink">{t("history")}</h2>
        <ul className="mt-4 divide-y divide-ink/8 rounded-2xl border border-ink/8">
          {history.map((draw) => (
            <li
              key={draw.id}
              className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm"
            >
              <span>
                {draw.month}/{draw.year} — {draw.status}
              </span>
              <span className="text-ink-muted">
                {draw.selected_book_id?.slice(0, 8) ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setPreviewDrawId(null);
        }}
      >
        {t("cancelDraw")}
      </Button>
    </div>
  );
}
