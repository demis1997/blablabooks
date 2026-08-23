"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BookMark } from "@/components/brand/decorative";

const PLACEHOLDER_TONES = [
  "bg-blush/50",
  "bg-powder/60",
  "bg-lavender/50",
  "bg-sage/60",
  "bg-butter/50",
] as const;

interface BookCoverProps {
  src?: string | null;
  alt: string;
  title?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % PLACEHOLDER_TONES.length;
  }
  return PLACEHOLDER_TONES[hash] ?? PLACEHOLDER_TONES[0];
}

export function BookCover({
  src,
  alt,
  title,
  sizes = "(max-width: 640px) 40vw, 180px",
  className,
  priority = false,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  const seed = title ?? alt;

  return (
    <div
      className={cn(
        "relative aspect-[2/3] overflow-hidden rounded-xl border border-ink/8 bg-paper shadow-sm",
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={cn(
            "flex size-full flex-col items-center justify-center gap-2 px-3 text-center",
            toneFor(seed),
          )}
          aria-hidden={!alt}
        >
          <BookMark className="size-7 text-ink/40" />
          {title ? (
            <span className="line-clamp-4 font-display text-xs font-medium leading-snug text-ink/70">
              {title}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
