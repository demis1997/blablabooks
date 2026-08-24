"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTokens } from "@/lib/motion/tokens";

type ReducedMotionBookProps = {
  children: React.ReactNode;
  className?: string;
};

/** Already-open book: short crossfade, no perspective or rotation. */
export function ReducedMotionBook({
  children,
  className,
}: ReducedMotionBookProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: motionTokens.duration.fast }}
    >
      {children}
    </motion.div>
  );
}
