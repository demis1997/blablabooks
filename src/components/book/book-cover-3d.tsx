"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BookMark } from "@/components/brand/decorative";
import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type BookCover3DProps = {
  src?: string | null;
  alt: string;
  title?: string;
  className?: string;
  priority?: boolean;
};

export function BookCover3D({
  src,
  alt,
  title,
  className,
  priority = false,
}: BookCover3DProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -(py * motionTokens.tiltMax),
      y: px * motionTokens.tiltMax,
    });
  }

  function onPointerLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: motionTokens.perspective }}
    >
      <motion.div
        ref={ref}
        className="relative aspect-[2/3] w-full origin-center"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          reduceMotion
            ? undefined
            : {
                rotateX: tilt.x,
                rotateY: tilt.y,
              }
        }
        whileHover={reduceMotion ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-r-md rounded-l-sm border border-ink/10 bg-paper"
          style={{
            boxShadow: `
              2px 0 0 rgb(48 44 53 / 0.06),
              4px 0 0 rgb(48 44 53 / 0.04),
              6px 0 0 rgb(48 44 53 / 0.03),
              8px 12px 28px rgb(48 44 53 / 0.14)
            `,
          }}
        >
          {showImage ? (
            <Image
              src={src!}
              alt={alt}
              fill
              sizes="(max-width: 640px) 45vw, 220px"
              priority={priority}
              className="object-cover"
              title={title}
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 bg-lavender/40 px-3 text-center">
              <BookMark className="size-7 text-ink/40" />
              {title ? (
                <span className="line-clamp-4 font-display text-xs font-medium leading-snug text-ink/70">
                  {title}
                </span>
              ) : null}
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-ink/15 to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}
