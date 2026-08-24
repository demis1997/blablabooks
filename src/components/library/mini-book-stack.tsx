"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookMark, Flower, SpeechBubble } from "@/components/brand/decorative";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import { ACCENT_SOFT } from "./palette";
import { PaperTexture } from "@/components/book/paper-texture";
import type { BookAccent } from "./types";

const STEPS: Array<{
  key: "1" | "2" | "3";
  coverKey: "pick" | "read" | "meet";
  Icon: typeof BookMark;
  accent: BookAccent;
  rotate: number;
}> = [
  { key: "1", coverKey: "pick", Icon: BookMark, accent: "blush", rotate: -4 },
  { key: "2", coverKey: "read", Icon: Flower, accent: "powder", rotate: 2 },
  { key: "3", coverKey: "meet", Icon: SpeechBubble, accent: "sage", rotate: -2 },
];

export function MiniBookStack() {
  const t = useTranslations("Home");
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto w-full max-w-5xl">
      <h2 className="mb-8 text-center font-display text-2xl text-ink sm:text-3xl">
        {t("howItWorks.title")}
      </h2>
      <ol className="grid gap-5 md:grid-cols-3">
        {STEPS.map(({ key, coverKey, Icon, accent, rotate }, index) => (
          <li key={key}>
            <motion.article
              className={cn(
                "relative overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-[8px_16px_28px_rgb(48_44_53/0.12)]",
              )}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 24,
                      x: (1 - index) * 36,
                      rotate: rotate * 2,
                    }
              }
              whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={
                reduceMotion ? undefined : { y: -6, rotate: rotate * 0.4 }
              }
              whileTap={reduceMotion ? undefined : { scale: 1.02 }}
              transition={{
                duration: motionTokens.duration.page,
                ease: motionTokens.ease.paper,
                delay: index * 0.08,
              }}
            >
              <div
                className={cn(
                  "book-cloth relative px-4 py-3",
                  ACCENT_SOFT[accent],
                )}
              >
                <PaperTexture className="opacity-[0.06]" />
                <div className="relative flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-md",
                      ACCENT_SOFT[accent],
                    )}
                  >
                    <Icon className="h-4 w-4 text-ink" />
                  </span>
                  <p className="font-display text-lg text-ink">
                    {t(`howItWorks.${coverKey}`)}
                  </p>
                </div>
              </div>
              <div className="relative px-4 py-4 sm:px-5">
                <PaperTexture className="opacity-[0.03]" />
                <p className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-display text-lg text-ink">
                  {t(`howItWorks.step${key}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t(`howItWorks.step${key}Body`)}
                </p>
              </div>
            </motion.article>
          </li>
        ))}
      </ol>
    </section>
  );
}
