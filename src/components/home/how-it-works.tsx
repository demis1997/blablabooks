"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookSpread } from "@/components/book/book-spread";
import { PaperCard } from "@/components/book/paper-card";
import { BookMark, Flower, SpeechBubble } from "@/components/brand/decorative";
import { motionTokens } from "@/lib/motion/tokens";

const STEPS = [
  { key: "1" as const, Icon: BookMark, accent: "bg-blush/50", rotate: -1 },
  { key: "2" as const, Icon: Flower, accent: "bg-powder/60", rotate: 0.6 },
  { key: "3" as const, Icon: SpeechBubble, accent: "bg-sage/70", rotate: -0.4 },
];

export function HowItWorks() {
  const t = useTranslations("Home");
  const tBook = useTranslations("BookExperience");
  const reduceMotion = useReducedMotion();

  return (
    <BookSpread
      chapter={tBook("chapterHow")}
      pageStart={7}
      className="rounded-none border-0 border-t border-ink/8 shadow-none bg-transparent"
      left={
        <div className="relative py-2">
          <h3 className="font-display text-2xl text-ink sm:text-3xl">
            {t("howItWorks.title")}
          </h3>

          <svg
            aria-hidden
            className="pointer-events-none absolute inset-x-2 top-[5.75rem] hidden h-10 w-[calc(100%-1rem)] text-ink/25 md:block"
            viewBox="0 0 300 24"
            fill="none"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M8 14 C 60 4, 100 22, 150 12 S 240 4, 292 14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="4 5"
              initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: motionTokens.duration.slow,
                ease: motionTokens.ease.ink,
              }}
            />
          </svg>

          <ol className="relative z-[1] mt-8 grid gap-4 sm:grid-cols-3 sm:gap-4">
            {STEPS.map(({ key, Icon, accent, rotate }, index) => (
              <li key={key}>
                <PaperCard rotate={rotate} className="h-full p-4 sm:p-5">
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
                  >
                    <Icon className="h-4 w-4 text-ink" />
                  </div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h4 className="mt-1 font-display text-lg text-ink">
                    {t(`howItWorks.step${key}Title`)}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {t(`howItWorks.step${key}Body`)}
                  </p>
                </PaperCard>
              </li>
            ))}
          </ol>
        </div>
      }
    />
  );
}
