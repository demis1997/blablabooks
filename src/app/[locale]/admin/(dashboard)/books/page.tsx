import { setRequestLocale } from "next-intl/server";
import { listBooks } from "@/lib/data/books";
import { BooksAdminList } from "@/components/admin/books-admin-list";
import type { Locale } from "@/lib/constants";
import type { BookStatus } from "@/types/database";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminBooksPage({
  params,
  searchParams,
}: PageProps) {
  const { locale: localeParam } = await params;
  const { status } = await searchParams;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const statusFilter = status ?? "all";
  const { books } = await listBooks({
    includeArchived: true,
    pageSize: 100,
    status:
      statusFilter !== "all" && statusFilter !== "archived"
        ? (statusFilter as BookStatus)
        : undefined,
  });

  // Always load full set for client-side archived filter when needed
  const all =
    statusFilter === "archived" || statusFilter === "all"
      ? (
          await listBooks({
            includeArchived: true,
            pageSize: 100,
          })
        ).books
      : books;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">Books</h1>
      <BooksAdminList books={all} statusFilter={statusFilter} />
    </div>
  );
}
