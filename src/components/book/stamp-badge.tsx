"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

const stampVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-ink/10 px-3 py-1 font-display text-xs font-semibold tracking-wide text-ink shadow-sm",
  {
    variants: {
      tone: {
        blush: "bg-blush/80",
        powder: "bg-powder/80",
        sage: "bg-sage/80",
        butter: "bg-butter/80",
      },
    },
    defaultVariants: {
      tone: "blush",
    },
  },
);

type StampBadgeProps = {
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof stampVariants>;

export function StampBadge({ children, tone, className }: StampBadgeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(stampVariants({ tone }), className)}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.65, rotate: -8 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { ...motionTokens.spring.stamp, delay: 0.05 }
      }
    >
      {children}
    </motion.span>
  );
}
