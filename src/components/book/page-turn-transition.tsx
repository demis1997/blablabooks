"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type PageTurnTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageTurnTransition({
  children,
  className,
}: PageTurnTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isAdmin = pathname.includes("/admin");

  if (isAdmin) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: motionTokens.perspective }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  rotateY: -10,
                  x: 20,
                  transformOrigin: "left center",
                }
          }
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  rotateY: 14,
                  x: -28,
                  transformOrigin: "left center",
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : {
                  duration: motionTokens.duration.page,
                  ease: motionTokens.ease.paper,
                }
          }
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
