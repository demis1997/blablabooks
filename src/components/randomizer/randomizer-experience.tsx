"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookCover3D } from "@/components/book/book-cover-3d";
import { BookCover } from "@/components/books/book-cover";
import { InkReveal } from "@/components/book/ink-reveal";
import { StampBadge } from "@/components/book/stamp-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Book } from "@/types/database";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export type RandomizerExperienceProps = {
  eligibleBooks: Book[];
  /** When true, shuffle/reveal is allowed but confirm is hidden/disabled. */
  displayOnly?: boolean;
  className?: string;
  onConfirm?: (book: Book) => Promise<void> | void;
  onDraw?: (eligibleIds: string[]) => Promise<Book | null> | Book | null;
};

type Phase = "idle" | "shuffling" | "revealing" | "revealed";

const STACK_SLOTS = [
  { x: -52, y: 18, r: -14, z: 1 },
  { x: -28, y: -6, r: -7, z: 2 },
  { x: 0, y: -18, r: 2, z: 4 },
  { x: 30, y: -4, r: 8, z: 3 },
  { x: 54, y: 16, r: 12, z: 1 },
  { x: -10, y: 28, r: -3, z: 5 },
] as const;

function CoverFace({
  book,
  className,
  priority,
}: {
  book: Book;
  className?: string;
  priority?: boolean;
}) {
  if (book.cover_url) {
    return (
      <BookCover3D
        src={book.cover_url}
        alt={book.title}
        title={book.title}
        className={className}
        priority={priority}
      />
    );
  }
  return (
    <BookCover
      src={book.cover_url}
      alt={book.title}
      title={book.title}
      className={className}
      priority={priority}
    />
  );
}

function PaperStars({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  if (!active || reduceMotion) return null;

  const stars = [
    { x: -70, y: -40, delay: 0 },
    { x: 65, y: -55, delay: 0.04 },
    { x: -40, y: 50, delay: 0.08 },
    { x: 55, y: 35, delay: 0.06 },
    { x: 0, y: -70, delay: 0.02 },
    { x: -85, y: 10, delay: 0.1 },
    { x: 90, y: -10, delay: 0.05 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {stars.map((s, i) => (
        <motion.svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className="absolute text-butter"
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.2, 1.1, 0.6],
            x: s.x,
            y: s.y,
          }}
          transition={{
            duration: 0.85,
            delay: s.delay,
            ease: motionTokens.ease.settle,
          }}
        >
          <path
            fill="currentColor"
            d="M7 0.5l1.4 4.2H13l-3.5 2.6 1.3 4.2L7 9.2 3.2 11.5l1.3-4.2L1 4.7h4.6z"
          />
        </motion.svg>
      ))}
    </div>
  );
}

function FloatingCover({
  book,
  slot,
  index,
  shuffling,
  floatPaused,
}: {
  book: Book;
  slot: (typeof STACK_SLOTS)[number];
  index: number;
  shuffling: boolean;
  floatPaused: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-28 sm:w-32"
      style={{ zIndex: slot.z }}
      initial={false}
      animate={
        shuffling && !reduceMotion
          ? {
              x: [slot.x - 16, slot.x + 18, slot.x - 10, slot.x],
              y: [slot.y - 40, slot.y - 28, slot.y - 48, slot.y - 40],
              rotate: [slot.r - 8, slot.r + 10, slot.r - 4, slot.r],
              scale: 0.96,
            }
          : floatPaused
            ? {
                x: slot.x,
                y: slot.y - 40,
                rotate: slot.r,
                scale: 1,
              }
            : {
                x: [slot.x - 2, slot.x + 3, slot.x - 2],
                y: [slot.y - 40, slot.y - 46, slot.y - 40],
                rotate: [slot.r - 1, slot.r + 1.5, slot.r - 1],
                scale: 1,
              }
      }
      transition={
        shuffling && !reduceMotion
          ? {
              duration: 0.55,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.04,
            }
          : floatPaused
            ? { type: "spring", stiffness: 120, damping: 20 }
            : {
                duration: 3.2 + index * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }
      }
    >
      <div className="-translate-x-1/2">
        <CoverFace book={book} />
      </div>
    </motion.div>
  );
}

/**
 * Public/admin randomizer UI. Public pages pass displayOnly so confirmation
 * stays admin-only even if a visitor triggers a visual draw.
 */
export function RandomizerExperience({
  eligibleBooks,
  displayOnly = false,
  className,
  onConfirm,
  onDraw,
}: RandomizerExperienceProps) {
  const t = useTranslations("Randomizer");
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<Book | null>(null);
  const [burst, setBurst] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  const count = eligibleBooks.length;

  const stackBooks = useMemo(() => {
    if (count === 0) return [];
    const n = Math.min(STACK_SLOTS.length, count);
    const step = Math.max(1, Math.floor(count / n));
    return Array.from(
      { length: n },
      (_, i) => eligibleBooks[(i * step) % count]!,
    );
  }, [count, eligibleBooks]);

  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const floatPaused =
    Boolean(reduceMotion) || pageHidden || phase !== "idle";

  const runDraw = () => {
    if (count === 0 || phase === "shuffling" || phase === "revealing") return;

    startTransition(() => {
      void (async () => {
        setPhase("shuffling");
        setPreview(null);
        setBurst(false);

        // Visual shuffle only — never treat flashed covers as the winner.
        if (!reduceMotion) {
          await new Promise((r) => setTimeout(r, 900));
        }

        let selected: Book | null = null;
        if (onDraw) {
          selected = await onDraw(eligibleBooks.map((b) => b.id));
        } else {
          const idx = Math.floor(Math.random() * count);
          selected = eligibleBooks[idx] ?? null;
        }

        // Reveal choreography uses the returned book id only after the draw resolves.
        if (!selected) {
          setPhase("idle");
          return;
        }

        setPreview(selected);
        setPhase("revealing");

        if (!reduceMotion) {
          await new Promise((r) => setTimeout(r, 420));
          setBurst(true);
          await new Promise((r) => setTimeout(r, 720));
        }

        setPhase("revealed");
        setBurst(false);
      })();
    });
  };

  if (count === 0) {
    return (
      <EmptyState
        title={t("eligibleCount", { count: 0 })}
        description={t("adminOnly")}
      />
    );
  }

  const showPile = phase === "idle" || phase === "shuffling";
  const showSelected =
    (phase === "revealing" || phase === "revealed") && preview;

  return (
    <div className={cn("mx-auto max-w-xl text-center", className)}>
      <p className="text-sm text-ink-muted">
        {t("eligibleCount", { count })}
      </p>
      {displayOnly ? (
        <p className="mt-2 text-sm text-ink-muted">{t("watching")}</p>
      ) : null}

      <div className="relative mx-auto mt-8 flex h-72 items-center justify-center sm:h-80">
        <AnimatePresence mode="sync">
          {showPile ? (
            <motion.div
              key="pile"
              className="relative h-full w-full max-w-sm"
              initial={false}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.92,
                      transition: { duration: 0.35 },
                    }
              }
            >
              {stackBooks.map((book, i) => (
                <FloatingCover
                  key={`${book.id}-${i}`}
                  book={book}
                  slot={STACK_SLOTS[i]!}
                  index={i}
                  shuffling={phase === "shuffling"}
                  floatPaused={floatPaused}
                />
              ))}
            </motion.div>
          ) : null}

          {showSelected && preview ? (
            <motion.div
              key={`reveal-${preview.id}`}
              className="relative w-40 sm:w-44"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 40, scale: 0.86, rotate: -6 }
              }
              animate={{
                opacity: 1,
                y: phase === "revealed" ? 0 : -28,
                scale: phase === "revealed" ? 1 : 1.06,
                rotate: 0,
              }}
              transition={{
                ...motionTokens.spring.soft,
              }}
            >
              <CoverFace book={preview} priority className="mx-auto" />
              <PaperStars active={burst || phase === "revealing"} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {phase === "revealed" && preview ? (
        <div className="mt-6">
          <StampBadge tone="blush" className="mx-auto">
            {t("reveal")}
          </StampBadge>
          <InkReveal delay={0.08} className="mt-3">
            <h3 className="font-display text-2xl text-ink sm:text-3xl">
              {preview.title}
            </h3>
          </InkReveal>
          <InkReveal delay={0.18}>
            <p className="mt-1 text-ink-muted">{preview.authors.join(", ")}</p>
          </InkReveal>
          {preview.page_count ? (
            <p className="mt-1 text-sm text-ink-muted">
              {preview.page_count} pages
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "shuffling" || phase === "revealing" ? (
        <p className="mt-6 text-ink-muted">{t("shuffling")}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {phase !== "revealed" ? (
          <Button
            size="lg"
            onClick={runDraw}
            disabled={
              isPending || phase === "shuffling" || phase === "revealing"
            }
          >
            {t("pickButton")}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setPhase("idle");
                setPreview(null);
                setBurst(false);
              }}
            >
              {t("drawAgain")}
            </Button>
            {!displayOnly ? (
              <Button
                size="lg"
                onClick={() => {
                  if (preview && onConfirm) void onConfirm(preview);
                }}
                disabled={!onConfirm || isPending}
              >
                {t("confirm")}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
