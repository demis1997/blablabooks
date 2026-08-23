"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type HandDrawnUnderlineProps = {
  className?: string;
  /** Draw when element enters viewport (default true). Hover also redraws. */
  inView?: boolean;
};

export function HandDrawnUnderline({
  className,
  inView = true,
}: HandDrawnUnderlineProps) {
  const reduceMotion = useReducedMotion();

  const pathProps = reduceMotion
    ? { pathLength: 1, opacity: 1 }
    : {
        initial: { pathLength: 0, opacity: 0.4 },
        whileInView: inView
          ? { pathLength: 1, opacity: 1 }
          : undefined,
        whileHover: { pathLength: 1, opacity: 1 },
        viewport: { once: true, amount: 0.8 },
        transition: {
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.ink,
        },
      };

  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-3 w-full max-w-[7.5rem] text-powder", className)}
      aria-hidden
    >
      <motion.path
        d="M2 8.5 C 22 2.5, 38 11, 58 6.5 C 78 2, 98 10.5, 118 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...pathProps}
      />
    </svg>
  );
}
