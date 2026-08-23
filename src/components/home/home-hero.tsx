"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/books/book-cover";
import { Star, SpeechBubble } from "@/components/brand/decorative";
import { INSTAGRAM_URL } from "@/lib/constants";
import type { Book } from "@/types/database";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  currentBook: Book | null;
  candidateBooks: Book[];
};

export function HomeHero({ currentBook, candidateBooks }: HomeHeroProps) {
  const t = useTranslations("Home");
  const reduceMotion = useReducedMotion();
  const covers = [
    currentBook,
    ...candidateBooks.filter((b) => b.id !== currentBook?.id),
  ]
    .filter(Boolean)
    .slice(0, 3) as Book[];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-blush/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-powder/50 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center md:gap-12 md:py-20 lg:px-8">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2 text-ink-muted">
            <Star className="h-4 w-4 text-blush" />
            <SpeechBubble className="h-4 w-4 text-powder" />
          </div>
          <motion.h1
            className="font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-6xl"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {t("heroTitle")}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          >
            {t("heroSubtitle")}
          </motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={currentBook ? "/#current-book" : "/books"}>
                {t("ctaCurrentBook")}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                {t("ctaInstagram")}
              </a>
            </Button>
          </div>
        </div>

        <motion.div
          className="relative mx-auto flex h-[280px] w-full max-w-md items-end justify-center sm:h-[320px]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          aria-hidden={covers.length === 0}
        >
          {covers.length === 0 ? (
            <div className="flex h-56 w-40 items-center justify-center rounded-xl bg-lavender/50 shadow-soft">
              <Star className="h-8 w-8 text-ink/30" />
            </div>
          ) : (
            covers.map((book, index) => {
              const rotations = [-8, 4, 12];
              const offsets = [
                "translate-x-[-28%] z-10",
                "translate-x-[0%] z-20",
                "translate-x-[28%] z-0",
              ];
              return (
                <div
                  key={book.id}
                  className={cn(
                    "absolute bottom-2 w-[38%] max-w-[140px] drop-shadow-md transition-transform",
                    offsets[index] ?? offsets[0],
                  )}
                  style={{ transform: `rotate(${rotations[index] ?? 0}deg)` }}
                >
                  <BookCover
                    src={book.cover_url}
                    alt={book.title}
                    title={book.title}
                    className="aspect-[2/3] w-full rounded-lg shadow-soft ring-1 ring-ink/5"
                    sizes="140px"
                  />
                </div>
              );
            })
          )}
          <div className="absolute inset-x-8 bottom-0 h-6 rounded-[100%] bg-ink/5 blur-sm" />
        </motion.div>
      </div>
    </section>
  );
}
