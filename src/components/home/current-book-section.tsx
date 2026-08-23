import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Book } from "@/types/database";
import type { Locale } from "@/lib/constants";

type CurrentBookSectionProps = {
  book: Book;
  locale: Locale;
};

export async function CurrentBookSection({
  book,
  locale,
}: CurrentBookSectionProps) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const description =
    locale === "ru"
      ? book.description_ru?.trim() || book.description
      : book.description?.trim() || book.description_ru;

  const selectedLabel =
    book.selected_month && book.selected_year
      ? new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
          month: "long",
          year: "numeric",
        }).format(new Date(book.selected_year, book.selected_month - 1, 1))
      : null;

  return (
    <section
      id="current-book"
      className="scroll-mt-24 border-y border-ink/5 bg-paper/50"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading title={t("currentBook")} />
        <div className="mt-8 grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="mx-auto w-44 md:mx-0 md:w-full">
            <BookCover
              src={book.cover_url}
              alt={book.title}
              title={book.title}
              className="aspect-[2/3] w-full rounded-2xl shadow-soft ring-1 ring-ink/5"
              sizes="(max-width: 768px) 176px, 240px"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <BookStatusBadge
                status={book.status}
                label={t("currentlyReading")}
              />
            </div>
            <h3 className="font-display text-3xl text-ink md:text-4xl">
              {book.title}
            </h3>
            {book.subtitle ? (
              <p className="mt-1 text-ink-muted">{book.subtitle}</p>
            ) : null}
            <p className="mt-3 text-base text-ink">
              {book.authors.join(", ")}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
              {book.page_count ? (
                <span>{t("pages", { count: book.page_count })}</span>
              ) : null}
              {book.language ? <span>{book.language.toUpperCase()}</span> : null}
              {selectedLabel ? <span>{selectedLabel}</span> : null}
            </div>
            {description ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted line-clamp-4">
                {description}
              </p>
            ) : null}
            <div className="mt-7">
              <Button asChild variant="outline">
                <Link href={`/books?status=currently_reading`}>
                  {t("viewDetails")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
