"use client";

import { useMemo, useState, useTransition } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookCover } from "@/components/books/book-cover";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Book } from "@/types/database";
import { cn } from "@/lib/utils";

export type RandomizerExperienceProps = {
  eligibleBooks: Book[];
  /** When true, shuffle/reveal is allowed but confirm is hidden/disabled. */
  displayOnly?: boolean;
  className?: string;
  onConfirm?: (book: Book) => Promise<void> | void;
  onDraw?: (eligibleIds: string[]) => Promise<Book | null> | Book | null;
};

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
  const [phase, setPhase] = useState<"idle" | "shuffling" | "revealed">(
    "idle",
  );
  const [preview, setPreview] = useState<Book | null>(null);
  const [flashIndex, setFlashIndex] = useState(0);

  const count = eligibleBooks.length;

  const flashBook = useMemo(() => {
    if (count === 0) return null;
    return eligibleBooks[flashIndex % count] ?? null;
  }, [count, eligibleBooks, flashIndex]);

  const runDraw = () => {
    if (count === 0 || phase === "shuffling") return;

    startTransition(() => {
      void (async () => {
        setPhase("shuffling");
        setPreview(null);

        if (!reduceMotion) {
          const ticks = 12;
          for (let i = 0; i < ticks; i += 1) {
            setFlashIndex((n) => n + 1);
            await new Promise((r) => setTimeout(r, 70 + i * 8));
          }
        }

        let selected: Book | null = null;
        if (onDraw) {
          selected = await onDraw(eligibleBooks.map((b) => b.id));
        } else {
          const idx = Math.floor(Math.random() * count);
          selected = eligibleBooks[idx] ?? null;
        }

        setPreview(selected);
        setPhase("revealed");
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

  return (
    <div className={cn("mx-auto max-w-xl text-center", className)}>
      <p className="text-sm text-ink-muted">
        {t("eligibleCount", { count })}
      </p>
      {displayOnly ? (
        <p className="mt-2 text-sm text-ink-muted">{t("watching")}</p>
      ) : null}

      <div className="relative mx-auto mt-8 flex h-64 items-center justify-center sm:h-72">
        <AnimatePresence mode="wait">
          {phase === "shuffling" && flashBook ? (
            <motion.div
              key={`flash-${flashBook.id}-${flashIndex}`}
              initial={reduceMotion ? false : { opacity: 0.4, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-36 sm:w-40"
            >
              <BookCover
                src={flashBook.cover_url}
                alt={flashBook.title}
                title={flashBook.title}
                className="shadow-soft"
              />
            </motion.div>
          ) : null}
          {phase === "revealed" && preview ? (
            <motion.div
              key={`reveal-${preview.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-40 sm:w-44"
            >
              <BookCover
                src={preview.cover_url}
                alt={preview.title}
                title={preview.title}
                className="shadow-soft ring-2 ring-blush/60"
                priority
              />
            </motion.div>
          ) : null}
          {phase === "idle" ? (
            <motion.div
              key="idle"
              className="rounded-3xl bg-gradient-to-br from-powder/50 via-paper to-blush/40 px-8 py-10 shadow-soft ring-1 ring-ink/5"
            >
              <p className="font-display text-2xl text-ink">{t("title")}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {phase === "revealed" && preview ? (
        <div className="mt-6">
          <p className="text-sm uppercase tracking-wider text-ink-muted">
            {t("reveal")}
          </p>
          <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            {preview.title}
          </h3>
          <p className="mt-1 text-ink-muted">{preview.authors.join(", ")}</p>
          {preview.page_count ? (
            <p className="mt-1 text-sm text-ink-muted">
              {preview.page_count} pages
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "shuffling" ? (
        <p className="mt-6 text-ink-muted">{t("shuffling")}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {phase !== "revealed" ? (
          <Button
            size="lg"
            onClick={runDraw}
            disabled={isPending || phase === "shuffling"}
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
