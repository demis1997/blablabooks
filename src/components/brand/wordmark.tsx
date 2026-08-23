"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/constants";

interface WordmarkProps {
  className?: string;
  href?: string;
  showUnderline?: boolean;
}

export function Wordmark({
  className,
  href = "/",
  showUnderline = true,
}: WordmarkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm",
        className,
      )}
    >
      <motion.span
        className="relative inline-flex origin-left"
        style={{ perspective: 600 }}
        whileHover={
          reduceMotion
            ? { scale: 1.03 }
            : { rotateY: -12, scale: 1.04 }
        }
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        <Image
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          className="h-9 w-auto object-contain sm:h-10"
          priority
        />
        <span className="sr-only">{SITE_NAME}</span>
      </motion.span>
      {showUnderline ? (
        <span
          aria-hidden
          className="hidden h-0.5 w-8 origin-left scale-x-0 rounded-full bg-powder transition-transform duration-300 group-hover:scale-x-100 sm:inline-block"
        />
      ) : null}
    </Link>
  );
}
