import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBookById } from "@/lib/data/books";
import { BookForm } from "@/components/admin/book-form";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditBookPage({ params }: PageProps) {
  const { locale: localeParam, id } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const book = await getBookById(id);
  if (!book) notFound();

  const t = await getTranslations({ locale, namespace: "Admin.books" });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">{t("editBook")}</h1>
      <BookForm mode="edit" book={book} />
    </div>
  );
}
