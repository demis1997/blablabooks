"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import type { Book, BookSearchResult } from "@/types/database";
import { createBook, refreshMetadata, updateBook } from "@/lib/actions/books";
import { BookSearchCombobox } from "@/components/admin/book-search-combobox";
import { BookCover } from "@/components/books/book-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { RefreshCw } from "lucide-react";

const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  subtitle: z.string().nullable().optional(),
  authorsText: z.string().min(1, "At least one author is required"),
  page_count: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
  description_ru: z.string().nullable().optional(),
  isbn_10: z.string().nullable().optional(),
  isbn_13: z.string().nullable().optional(),
  first_publish_year: z.number().int().min(1000).max(3000).nullable().optional(),
  edition_publish_year: z
    .number()
    .int()
    .min(1000)
    .max(3000)
    .nullable()
    .optional(),
  language: z.string().nullable().optional(),
  subjectsText: z.string().optional(),
  open_library_work_key: z.string().nullable().optional(),
  open_library_edition_key: z.string().nullable().optional(),
  google_books_id: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  custom_cover_path: z.string().nullable().optional(),
  status: z
    .enum(["candidate", "currently_reading", "previously_read", "archived"])
    .default("candidate"),
  selected_month: z.number().int().min(1).max(12).nullable().optional(),
  selected_year: z.number().int().min(2000).max(2100).nullable().optional(),
  club_note: z.string().nullable().optional(),
  club_note_ru: z.string().nullable().optional(),
});

type FormValues = z.input<typeof formSchema>;

function toFormValues(book?: Book | null): FormValues {
  return {
    title: book?.title ?? "",
    subtitle: book?.subtitle ?? null,
    authorsText: book?.authors.join(", ") ?? "",
    page_count: book?.page_count ?? null,
    description: book?.description ?? null,
    description_ru: book?.description_ru ?? null,
    isbn_10: book?.isbn_10 ?? null,
    isbn_13: book?.isbn_13 ?? null,
    first_publish_year: book?.first_publish_year ?? null,
    edition_publish_year: book?.edition_publish_year ?? null,
    language: book?.language ?? null,
    subjectsText: book?.subjects.join(", ") ?? "",
    open_library_work_key: book?.open_library_work_key ?? null,
    open_library_edition_key: book?.open_library_edition_key ?? null,
    google_books_id: book?.google_books_id ?? null,
    cover_url: book?.cover_url ?? null,
    custom_cover_path: book?.custom_cover_path ?? null,
    status: book?.status ?? "candidate",
    selected_month: book?.selected_month ?? null,
    selected_year: book?.selected_year ?? null,
    club_note: book?.club_note ?? null,
    club_note_ru: book?.club_note_ru ?? null,
  };
}

function parseList(text: string): string[] {
  return text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type BookFormProps = {
  book?: Book | null;
  mode: "create" | "edit";
};

export function BookForm({ book, mode }: BookFormProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [duplicates, setDuplicates] = useState<Book[]>([]);
  const [overrideDuplicate, setOverrideDuplicate] = useState(false);

  const defaults = useMemo(() => toFormValues(book), [book]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  });

  const coverUrl = form.watch("cover_url");
  const title = form.watch("title");

  const applySearchResult = (result: BookSearchResult) => {
    form.setValue("title", result.title);
    form.setValue("subtitle", result.subtitle ?? null);
    form.setValue("authorsText", result.authors.join(", "));
    form.setValue("page_count", result.pageCount ?? null);
    form.setValue("description", result.description ?? null);
    form.setValue("isbn_10", result.isbn10 ?? null);
    form.setValue("isbn_13", result.isbn13 ?? null);
    form.setValue("first_publish_year", result.firstPublishYear ?? null);
    form.setValue("language", result.language ?? null);
    form.setValue("subjectsText", (result.subjects ?? []).join(", "));
    form.setValue("cover_url", result.coverUrl ?? null);
    form.setValue(
      "open_library_work_key",
      result.openLibraryWorkKey ?? null,
    );
    form.setValue(
      "open_library_edition_key",
      result.openLibraryEditionKey ?? null,
    );
    form.setValue("google_books_id", result.googleBooksId ?? null);
    setDuplicates([]);
    setOverrideDuplicate(false);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      void (async () => {
        const authors = parseList(values.authorsText);
        const subjects = parseList(values.subjectsText ?? "");
        const payload = {
          title: values.title,
          subtitle: values.subtitle,
          authors,
          page_count: values.page_count,
          description: values.description,
          description_ru: values.description_ru,
          isbn_10: values.isbn_10,
          isbn_13: values.isbn_13,
          first_publish_year: values.first_publish_year,
          edition_publish_year: values.edition_publish_year,
          language: values.language,
          subjects,
          open_library_work_key: values.open_library_work_key,
          open_library_edition_key: values.open_library_edition_key,
          google_books_id: values.google_books_id,
          cover_url: values.cover_url,
          custom_cover_path: values.custom_cover_path,
          status: values.status,
          selected_month: values.selected_month,
          selected_year: values.selected_year,
          club_note: values.club_note,
          club_note_ru: values.club_note_ru,
        };

        if (mode === "create") {
          const result = await createBook({
            ...payload,
            overrideDuplicate,
          });
          if (!result.ok && result.error === "duplicate") {
            setDuplicates(result.duplicates ?? []);
            toast.error(t("duplicateWarning"));
            return;
          }
          if (!result.ok) {
            toast.error(result.error ?? t("toasts.error"));
            return;
          }
          toast.success(t("toasts.saved"));
          router.push("/admin/books");
          router.refresh();
          return;
        }

        if (!book) return;
        const result = await updateBook({ id: book.id, ...payload });
        if (!result.ok) {
          toast.error(result.error ?? t("toasts.error"));
          return;
        }
        toast.success(t("toasts.saved"));
        router.push("/admin/books");
        router.refresh();
      })();
    });
  });

  return (
    <div className="space-y-8">
      {mode === "create" ? (
        <BookSearchCombobox onSelect={applySearchResult} />
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[180px_1fr]">
        <div className="space-y-3">
          <div className="w-40">
            <BookCover
              src={coverUrl}
              alt={title || "Cover"}
              title={title || "Cover"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover_url">{t("books.coverUrl")}</Label>
            <Input id="cover_url" {...form.register("cover_url")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">{t("books.title")}</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-red-700">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="subtitle">{t("books.subtitle")}</Label>
            <Input id="subtitle" {...form.register("subtitle")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="authorsText">{t("books.authors")}</Label>
            <Input id="authorsText" {...form.register("authorsText")} />
            <p className="text-xs text-ink-muted">{t("books.authorsHint")}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="page_count">{t("books.pageCount")}</Label>
            <Input
              id="page_count"
              type="number"
              {...form.register("page_count", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(v),
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("books.status")}</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) =>
                form.setValue(
                  "status",
                  v as FormValues["status"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">candidate</SelectItem>
                <SelectItem value="currently_reading">
                  currently_reading
                </SelectItem>
                <SelectItem value="previously_read">previously_read</SelectItem>
                <SelectItem value="archived">archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="isbn_13">{t("books.isbn13")}</Label>
            <Input id="isbn_13" {...form.register("isbn_13")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="isbn_10">{t("books.isbn10")}</Label>
            <Input id="isbn_10" {...form.register("isbn_10")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="first_publish_year">
              {t("books.firstPublishYear")}
            </Label>
            <Input
              id="first_publish_year"
              type="number"
              {...form.register("first_publish_year", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(v),
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edition_publish_year">
              {t("books.editionPublishYear")}
            </Label>
            <Input
              id="edition_publish_year"
              type="number"
              {...form.register("edition_publish_year", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(v),
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="language">{t("books.language")}</Label>
            <Input id="language" {...form.register("language")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subjectsText">{t("books.subjects")}</Label>
            <Input id="subjectsText" {...form.register("subjectsText")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">{t("books.description")}</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description_ru">{t("books.descriptionRu")}</Label>
            <Textarea
              id="description_ru"
              rows={4}
              {...form.register("description_ru")}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="club_note">{t("books.clubNote")}</Label>
            <Textarea id="club_note" rows={2} {...form.register("club_note")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="club_note_ru">{t("books.clubNoteRu")}</Label>
            <Textarea
              id="club_note_ru"
              rows={2}
              {...form.register("club_note_ru")}
            />
          </div>

          {duplicates.length > 0 ? (
            <div className="sm:col-span-2 rounded-xl border border-amber-500/30 bg-amber-50/80 p-4 text-sm">
              <p className="font-medium text-ink">{t("duplicateWarning")}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
                {duplicates.map((d) => (
                  <li key={d.id}>
                    {d.title} — {d.authors.join(", ")}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  setOverrideDuplicate(true);
                  toast.message(t("overrideDuplicate"));
                }}
              >
                {t("overrideDuplicate")}
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="submit" disabled={isPending}>
              {t("forms.save")}
            </Button>
            {mode === "edit" && book ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    void (async () => {
                      const result = await refreshMetadata(book.id);
                      if (!result.ok) {
                        toast.error(result.error ?? t("toasts.error"));
                        return;
                      }
                      toast.success(t("toasts.saved"));
                      if (result.data) {
                        form.reset({
                          ...form.getValues(),
                          page_count: result.data.page_count,
                          description: result.data.description,
                          cover_url: result.data.cover_url,
                          isbn_10: result.data.isbn_10,
                          isbn_13: result.data.isbn_13,
                        });
                      }
                      router.refresh();
                    })();
                  });
                }}
              >
                <RefreshCw className="size-4" />
                {t("books.refreshMetadata")}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/books")}
            >
              {t("forms.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
