"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookCover3D } from "@/components/book/book-cover-3d";
import { HandDrawnUnderline } from "@/components/book/hand-drawn-underline";
import { InkReveal } from "@/components/book/ink-reveal";
import { Star, SpeechBubble } from "@/components/brand/decorative";
import { INSTAGRAM_URL, SITE_NAME } from "@/lib/constants";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/database";
import { BookCover } from "./book-cover";
import { BookPages } from "./book-pages";
import { BookmarkRibbon } from "./bookmark-ribbon";
import { useBookOpen } from "./use-book-open";

type HeroHardcoverProps = {
  currentBook: Book | null;
  candidateBooks: Book[];
};

export function HeroHardcover({
  currentBook,
  candidateBooks,
}: HeroHardcoverProps) {
  const t = useTranslations("Home");
  const reducePref = useReducedMotion();
  const { ref, open } = useBookOpen(0.15);
  const [phase, setPhase] = useState<"cover" | "open">(
    reducePref ? "open" : "cover",
  );

  useEffect(() => {
    if (reducePref) return;
    const id = window.setTimeout(() => setPhase("open"), 850);
    return () => window.clearTimeout(id);
  }, [reducePref]);

  const isOpen = reducePref || (open && phase === "open");
  const covers = [
    currentBook,
    ...candidateBooks.filter((b) => b.id !== currentBook?.id),
  ]
    .filter(Boolean)
    .slice(0, 3) as Book[];

  return (
    <section
      ref={ref}
      className="relative mx-auto w-full max-w-5xl"
      style={{ perspective: motionTokens.perspective }}
    >
      <motion.article
        className="relative overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-[12px_22px_40px_rgb(48_44_53/0.16),16px_0_0_rgb(48_44_53/0.05)]"
        initial={
          reducePref ? false : { opacity: 0, y: 56, rotateX: 8 }
        }
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: motionTokens.duration.intro,
          ease: motionTokens.ease.paper,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <BookmarkRibbon tone="blush" />
        <div className="lg:hidden">
          <BookCover
            accent="blush"
            binding="hardcover"
            title={SITE_NAME}
            subtitle={t("heroTitle")}
            motif={
              <span className="inline-flex items-center gap-2">
                <Star className="h-5 w-5" />
                <SpeechBubble className="h-5 w-5" />
              </span>
            }
            className="min-h-[11rem]"
          />
        </div>

        <BookPages
          left={
            <div className="flex h-full flex-col justify-center py-2">
              <div className="mb-4 flex items-center gap-2 text-ink-muted">
                <Star className="h-4 w-4 text-blush" />
                <SpeechBubble className="h-4 w-4 text-powder" />
              </div>
              <p className="font-display text-xs uppercase tracking-[0.22em] text-ink-muted">
                {SITE_NAME}
              </p>
              <InkReveal>
                <h1 className="mt-2 font-display text-3xl leading-[1.12] tracking-tight text-ink sm:text-4xl lg:text-5xl">
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
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                <div className="flex h-52 w-36 items-center justify-center rounded-lg bg-lavender/50">
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

        <motion.div
          className="pointer-events-none absolute inset-0 z-20 hidden origin-left lg:block"
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          animate={{ rotateY: isOpen ? -158 : 0 }}
          transition={{
            duration: motionTokens.duration.intro,
            ease: motionTokens.ease.paper,
          }}
        >
          <BookCover
            accent="blush"
            binding="hardcover"
            title={SITE_NAME}
            subtitle={t("heroTitle")}
            motif={
              <span className="inline-flex items-center gap-2">
                <Star className="h-6 w-6" />
                <SpeechBubble className="h-6 w-6" />
              </span>
            }
            className="h-full min-h-full"
          />
        </motion.div>
      </motion.article>
    </section>
  );
}
