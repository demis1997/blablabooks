import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BooksBrowser } from "@/components/books/books-browser";
import { CatalogueShelf } from "@/components/library/catalogue-shelf";
import { listBooks, type BookSort } from "@/lib/data/books";
import { routing } from "@/i18n/routing";
import type { BookStatus } from "@/types/database";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 24;

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Books" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BooksPage({ params, searchParams }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const sp = await searchParams;
  const q = firstParam(sp.q) ?? "";
  const statusParam = firstParam(sp.status) ?? "";
  const sortParam = (firstParam(sp.sort) ?? "date_added") as BookSort;

  const allowedStatus: BookStatus[] = [
    "candidate",
    "currently_reading",
    "previously_read",
  ];
  const status = allowedStatus.includes(statusParam as BookStatus)
    ? (statusParam as BookStatus)
    : undefined;

  const allowedSort: BookSort[] = [
    "date_added",
    "title",
    "author",
    "page_count",
  ];
  const sort = allowedSort.includes(sortParam) ? sortParam : "date_added";

  // Fetch a large first page so client filters feel instant; load-more is client-side.
  const result = await listBooks({
    search: q || undefined,
    status,
    sort,
    page: 1,
    pageSize: 100,
  });

  const t = await getTranslations({ locale, namespace: "Books" });

  return (
    <CatalogueShelf title={t("title")} subtitle={t("subtitle")}>
      <BooksBrowser
        initialBooks={result.books}
        total={result.total}
        pageSize={PAGE_SIZE}
        initialSearch={q}
        initialStatus={status ?? ""}
        initialSort={sort}
      />
    </CatalogueShelf>
  );
}
