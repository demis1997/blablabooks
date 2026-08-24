"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTokens } from "@/lib/motion/tokens";
import { BookmarkRibbon } from "./bookmark-ribbon";
import { BookCover } from "./book-cover";
import { BookPages } from "./book-pages";
import { BookSpine } from "./book-spine";
import { ENTRANCES, FADE_ENTRANCE, entranceTransition } from "./entrances";
import { ReducedMotionBook } from "./reduced-motion-book";
import { ACCENT_FILL } from "./palette";
import { useBookOpen } from "./use-book-open";
import type {
  BookAccent,
  BookBinding,
  BookEntrance,
  BookSize,
} from "./types";

const SIZE_CLASS: Record<BookSize, string> = {
  hero: "max-w-5xl",
  novel: "max-w-4xl",
  diary: "max-w-3xl",
  mini: "max-w-sm",
  album: "max-w-5xl",
  zine: "max-w-xl",
  journal: "max-w-4xl",
};

const THICKNESS = {
  thin: "shadow-[8px_16px_32px_rgb(48_44_53/0.12)]",
  medium:
    "shadow-[10px_18px_36px_rgb(48_44_53/0.14),14px_0_0_rgb(48_44_53/0.04),18px_0_0_rgb(48_44_53/0.03)]",
  thick:
    "shadow-[12px_22px_40px_rgb(48_44_53/0.16),16px_0_0_rgb(48_44_53/0.05),20px_0_0_rgb(48_44_53/0.035),24px_0_0_rgb(48_44_53/0.02)]",
} as const;

type SectionBookProps = {
  accent: BookAccent;
  binding?: BookBinding;
  size?: BookSize;
  thickness?: keyof typeof THICKNESS;
  entrance?: BookEntrance;
  coverTitle: string;
  coverSubtitle?: string;
  coverMotif?: React.ReactNode;
  coverExtra?: React.ReactNode;
  left: React.ReactNode;
  right?: React.ReactNode;
  ribbon?: boolean;
  pageTone?: string;
  rounded?: string;
  alwaysOpen?: boolean;
  id?: string;
  className?: string;
  delay?: number;
};

export function SectionBook({
  accent,
  binding = "hardcover",
  size = "novel",
  thickness = "medium",
  entrance = "rise",
  coverTitle,
  coverSubtitle,
  coverMotif,
  coverExtra,
  left,
  right,
  ribbon = false,
  pageTone,
  rounded,
  alwaysOpen = false,
  id,
  className,
  delay = 0,
}: SectionBookProps) {
  const { ref, open, reduceMotion } = useBookOpen(0.26);
  const isOpen = alwaysOpen || open;
  const radius =
    rounded ??
    (binding === "diary"
      ? "rounded-3xl"
      : binding === "zine"
        ? "rounded-sm"
        : "rounded-xl");

  const interior = (
    <div className="relative">
      {ribbon ? <BookmarkRibbon tone={accent} /> : null}
      <div className="flex">
        <BookSpine accent={accent} stamped={binding !== "zine"} />
        <div className="min-w-0 flex-1">
          <BookPages left={left} right={right} pageTone={pageTone} />
        </div>
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-4 right-0 hidden w-1.5 lg:block",
          ACCENT_FILL[accent],
          "opacity-40",
        )}
      />
    </div>
  );

  const cover = (
    <BookCover
      accent={accent}
      binding={binding}
      title={coverTitle}
      subtitle={coverSubtitle}
      motif={coverMotif}
      className="h-full min-h-[14rem]"
    >
      {coverExtra}
    </BookCover>
  );

  if (reduceMotion) {
    return (
      <section id={id} className={cn("mx-auto w-full", SIZE_CLASS[size], className)}>
        <ReducedMotionBook>
          <div
            className={cn(
              "overflow-hidden border border-ink/10 bg-paper",
              radius,
              THICKNESS[thickness],
            )}
          >
            <div className="lg:hidden">{cover}</div>
            {interior}
          </div>
        </ReducedMotionBook>
      </section>
    );
  }

  const pair = ENTRANCES[entrance] ?? ENTRANCES.rise;

  return (
    <section
      id={id}
      ref={ref}
      className={cn("mx-auto w-full", SIZE_CLASS[size], className)}
      style={{ perspective: motionTokens.perspective }}
    >
      <motion.article
        className={cn(
          "relative overflow-hidden border border-ink/10 bg-paper",
          radius,
          THICKNESS[thickness],
        )}
        initial={pair.hidden}
        whileInView={pair.shown}
        viewport={{ once: true, amount: 0.22 }}
        transition={entranceTransition(delay)}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Mobile: cover as identity banner, content always readable underneath */}
        <motion.div
          className="lg:hidden"
          initial={FADE_ENTRANCE.hidden}
          whileInView={FADE_ENTRANCE.shown}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 0.05 }}
        >
          {cover}
        </motion.div>

        {interior}

        {/* Desktop: hinged cover that folds away */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 hidden origin-left lg:block"
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          animate={{ rotateY: isOpen ? -158 : 0 }}
          transition={{
            duration: motionTokens.duration.intro,
            ease: motionTokens.ease.paper,
            delay: delay + 0.18,
          }}
        >
          {cover}
        </motion.div>
      </motion.article>
    </section>
  );
}
