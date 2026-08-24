"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BookCover3D } from "@/components/book/book-cover-3d";
import { InkReveal } from "@/components/book/ink-reveal";
import { StampBadge } from "@/components/book/stamp-badge";
import { Button } from "@/components/ui/button";
import { motionTokens } from "@/lib/motion/tokens";
import type { Book } from "@/types/database";
import type { Locale } from "@/lib/constants";
import { LibraryLabel } from "./library-label";
import { PaperPocket } from "./paper-pocket";
import { SectionBook } from "./section-book";

type CurrentReadNovelProps = {
  book: Book;
  locale: Locale;
};

export function CurrentReadNovel({ book, locale }: CurrentReadNovelProps) {
  const t = useTranslations("Home");
  const reduceMotion = useReducedMotion();

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

  const slips = [
    book.authors.join(", "),
    book.page_count ? t("pages", { count: book.page_count }) : null,
    book.language ? book.language.toUpperCase() : null,
    selectedLabel,
  ].filter(Boolean) as string[];

  return (
    <SectionBook
      id="current-book"
      accent="powder"
      binding="novel"
      size="novel"
      entrance="fromStack"
      ribbon
      coverTitle={t("thisMonthsRead")}
      coverSubtitle={t("currentlyReading")}
      left={
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <StampBadge tone="powder">{t("currentlyReading")}</StampBadge>
          <PaperPocket className="w-full max-w-[220px] bg-powder/20">
            <motion.div
              className="w-full"
              initial={reduceMotion ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: motionTokens.duration.page,
                ease: motionTokens.ease.settle,
                delay: 0.15,
              }}
            >
              <BookCover3D
                src={book.cover_url}
                alt={book.title}
                title={book.title}
                priority
                className="w-full"
              />
            </motion.div>
          </PaperPocket>
        </div>
      }
      right={
        <div className="flex h-full flex-col justify-center py-2">
          <InkReveal>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {book.title}
            </h2>
          </InkReveal>
          {book.subtitle ? (
            <p className="mt-1 text-ink-muted">{book.subtitle}</p>
          ) : null}
          <ul className="mt-5 flex flex-col gap-2">
            {slips.map((slip, i) => (
              <li key={`${slip}-${i}`}>
                <LibraryLabel rotate={i % 2 === 0 ? -0.8 : 0.6}>
                  {slip}
                </LibraryLabel>
              </li>
            ))}
          </ul>
          {description ? (
            <InkReveal delay={0.1} className="mt-5">
              <p className="max-w-md text-base leading-relaxed text-ink-muted line-clamp-5">
                {description}
              </p>
            </InkReveal>
          ) : null}
          <div className="mt-7">
            <Button asChild variant="outline">
              <Link href="/books?status=currently_reading">
                {t("viewDetails")}
              </Link>
            </Button>
          </div>
        </div>
      }
    />
  );
}
