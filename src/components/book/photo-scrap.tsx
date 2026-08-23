"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type PhotoScrapProps = {
  src: string;
  alt: string;
  caption?: string | null;
  rotate?: number;
  tapeTone?: "blush" | "powder" | "lavender" | "sage" | "butter";
  className?: string;
  sizes?: string;
};

const TAPE_COLORS = {
  blush: "bg-blush/80",
  powder: "bg-powder/80",
  lavender: "bg-lavender/80",
  sage: "bg-sage/80",
  butter: "bg-butter/80",
} as const;

export function PhotoScrap({
  src,
  alt,
  caption,
  rotate = -2,
  tapeTone = "blush",
  className,
  sizes = "(max-width: 640px) 50vw, 25vw",
}: PhotoScrapProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.figure
      className={cn(
        "relative bg-paper p-2 pb-8 shadow-[var(--shadow-soft)] ring-1 ring-ink/8",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -8, rotate: rotate * 0.35, zIndex: 2 }
      }
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <span
        aria-hidden
        className={cn(
          "washi-tape left-1/2 top-0 z-[2] w-[55%]",
          TAPE_COLORS[tapeTone],
        )}
        style={{ transform: "translate(-50%, -45%) rotate(-2deg)" }}
      />
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 line-clamp-2 px-1 text-center font-display text-xs text-ink-muted">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}
