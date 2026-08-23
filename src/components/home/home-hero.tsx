"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookSpread } from "@/components/book/book-spread";
import { BookCover3D } from "@/components/book/book-cover-3d";
import { HandDrawnUnderline } from "@/components/book/hand-drawn-underline";
import { InkReveal } from "@/components/book/ink-reveal";
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
  const tBook = useTranslations("BookExperience");
  const covers = [
    currentBook,
    ...candidateBooks.filter((b) => b.id !== currentBook?.id),
  ]
    .filter(Boolean)
    .slice(0, 3) as Book[];

  return (
    <BookSpread
      chapter={tBook("chapterWelcome")}
      pageStart={1}
      className="rounded-none border-0 shadow-none bg-transparent"
      left={
        <div className="flex h-full flex-col justify-center py-2">
          <div className="mb-4 flex items-center gap-2 text-ink-muted">
            <Star className="h-4 w-4 text-blush" />
            <SpeechBubble className="h-4 w-4 text-powder" />
          </div>
          <InkReveal>
            <h1 className="font-display text-3xl leading-[1.12] tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {t("heroTitle")}
            </h1>
          </InkReveal>
          <HandDrawnUnderline className="mt-2 max-w-[9rem]" />
          <InkReveal delay={0.12}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              {t("heroSubtitle")}
            </p>
          </InkReveal>
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
      }
      right={
        <div
          className="relative mx-auto flex h-[260px] w-full max-w-sm items-end justify-center sm:h-[300px]"
          aria-hidden={covers.length === 0}
        >
          {covers.length === 0 ? (
            <div className="flex h-52 w-36 items-center justify-center rounded-lg bg-lavender/50 shadow-soft">
              <Star className="h-8 w-8 text-ink/30" />
            </div>
          ) : (
            covers.map((book, index) => {
              const rotations = [-10, 3, 11];
              const offsets = [
                "left-[8%] z-10",
                "left-1/2 z-20 -translate-x-1/2",
                "right-[8%] z-0",
              ];
              return (
                <div
                  key={book.id}
                  className={cn(
                    "absolute bottom-3 w-[42%] max-w-[150px]",
                    offsets[index] ?? offsets[0],
                  )}
                  style={{
                    transform: `rotate(${rotations[index] ?? 0}deg)`,
                  }}
                >
                  <BookCover3D
                    src={book.cover_url}
                    alt={book.title}
                    title={book.title}
                    priority={index === 0}
                    className="w-full"
                  />
                </div>
              );
            })
          )}
          <div className="absolute inset-x-10 bottom-0 h-5 rounded-[100%] bg-ink/5 blur-sm" />
        </div>
      }
    />
  );
}
