"use client";

import { cn } from "@/lib/utils";
import { PaperTexture } from "@/components/book/paper-texture";
import { ACCENT_FILL } from "./palette";
import type { BookAccent, BookBinding } from "./types";

type BookCoverProps = {
  accent: BookAccent;
  binding?: BookBinding;
  title: string;
  subtitle?: string;
  motif?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function BookCover({
  accent,
  binding = "hardcover",
  title,
  subtitle,
  motif,
  className,
  children,
}: BookCoverProps) {
  const rounded =
    binding === "diary"
      ? "rounded-2xl"
      : binding === "zine"
        ? "rounded-sm"
        : "rounded-r-md rounded-l-sm";

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[12rem] flex-col items-center justify-center overflow-hidden px-6 py-8 text-center",
        ACCENT_FILL[accent],
        binding === "hardcover" || binding === "novel" || binding === "album"
          ? "book-cloth"
          : "",
        binding === "zine" && "book-torn-edge",
        rounded,
        className,
      )}
    >
      <PaperTexture className="opacity-[0.07]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-ink/18 to-transparent"
      />
      {motif ? (
        <div className="relative mb-3 text-ink/70" aria-hidden>
          {motif}
        </div>
      ) : null}
      <p className="relative font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
        {title}
      </p>
      {subtitle ? (
        <p className="relative mt-2 max-w-xs font-display text-sm italic text-ink/75">
          {subtitle}
        </p>
      ) : null}
      {children}
    </div>
  );
}
