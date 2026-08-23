"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type InkRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function InkReveal({ children, className, delay = 0 }: InkRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.ink,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
