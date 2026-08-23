import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookForm } from "@/components/admin/book-form";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewBookPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.books" });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">{t("addBook")}</h1>
      <BookForm mode="create" />
    </div>
  );
}
