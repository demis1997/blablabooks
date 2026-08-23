"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type PageNumberProps = {
  number: number | string;
  className?: string;
};

export function PageNumber({ number, className }: PageNumberProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "inline-block font-display text-xs tabular-nums tracking-widest text-ink-muted",
        className,
      )}
      whileHover={
        reduceMotion
          ? undefined
          : { rotate: [0, -4, 3, -2, 0], transition: { duration: 0.45 } }
      }
    >
      {number}
    </motion.span>
  );
}
