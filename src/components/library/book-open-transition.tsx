"use client";

import { motion } from "framer-motion";
import { motionTokens } from "@/lib/motion/tokens";

type BookOpenTransitionProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

export function BookOpenTransition({
  open,
  children,
  className,
}: BookOpenTransitionProps) {
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
      animate={{ rotateY: open ? -158 : 0 }}
      transition={{
        duration: motionTokens.duration.intro,
        ease: motionTokens.ease.paper,
      }}
    >
      {children}
    </motion.div>
  );
}
