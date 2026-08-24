"use client";

import { motion } from "framer-motion";
import { motionTokens } from "@/lib/motion/tokens";

type BookCloseTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export function BookCloseTransition({
  children,
  className,
}: BookCloseTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0.96, x: -24 }}
      transition={{
        duration: motionTokens.duration.fast,
        ease: motionTokens.ease.ink,
      }}
    >
      {children}
    </motion.div>
  );
}
