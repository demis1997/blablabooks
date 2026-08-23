"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import { BookPage } from "@/components/book/book-page";

type BookSpreadProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  chapter?: string;
  pageStart?: number;
  className?: string;
};

export function BookSpread({
  left,
  right,
  chapter,
  pageStart = 1,
  className,
}: BookSpreadProps) {
  const reduceMotion = useReducedMotion();
  const hasRight = right != null;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-[var(--shadow-soft)]",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: motionTokens.duration.page,
        ease: motionTokens.ease.paper,
      }}
    >
      <div
        className={cn(
          "grid",
          hasRight ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        <BookPage
          side="left"
          chapterTitle={chapter}
          pageNumber={pageStart}
          className={cn(hasRight && "lg:border-r lg:border-ink/8")}
        >
          {left}
        </BookPage>

        {hasRight ? (
          <BookPage
            side="right"
            pageNumber={pageStart + 1}
            className="border-t border-ink/8 lg:border-t-0"
          >
            {right}
          </BookPage>
        ) : null}
      </div>

      {hasRight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-4 left-1/2 hidden w-px -translate-x-1/2 bg-ink/10 shadow-[0_0_24px_12px_rgb(48_44_53/0.08)] lg:block"
        />
      ) : null}
    </motion.div>
  );
}
