"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { hasSeenIntro, markIntroSeen } from "@/lib/motion/session";
import { motionTokens } from "@/lib/motion/tokens";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BookCoverIntroProps = {
  onComplete: () => void;
  openLabel: string;
  skipLabel: string;
  className?: string;
};

export function BookCoverIntro({
  onComplete,
  openLabel,
  skipLabel,
  className,
}: BookCoverIntroProps) {
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const finished = useRef(false);
  const coverRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    markIntroSeen();
    setVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (reduceMotion) {
      markIntroSeen();
      const id = window.setTimeout(finish, 200);
      return () => window.clearTimeout(id);
    }

    if (hasSeenIntro()) {
      const id = window.setTimeout(finish, 400);
      return () => window.clearTimeout(id);
    }
  }, [reduceMotion, finish]);

  const openBook = useCallback(() => {
    if (opening || finished.current) return;
    setOpening(true);
    window.setTimeout(
      finish,
      reduceMotion ? 200 : motionTokens.duration.intro * 1000,
    );
  }, [opening, finish, reduceMotion]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBook();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openBook, skip]);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || opening || !coverRef.current) return;
    const rect = coverRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -(py * motionTokens.tiltMax * 0.6),
      y: px * motionTokens.tiltMax * 0.6,
    });
  }

  function onPointerLeave() {
    setTilt({ x: 0, y: 0 });
  }

  if (!visible) return null;

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center book-desk-bg",
        className,
      )}
      initial={{ opacity: 1 }}
      animate={{ opacity: opening && reduceMotion ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: motionTokens.duration.fast }}
      role="dialog"
      aria-modal="true"
      aria-label={SITE_NAME}
    >
      <div
        className="relative flex w-full max-w-md flex-col items-center gap-8 px-6"
        style={{ perspective: motionTokens.perspective }}
      >
        <motion.div
          ref={coverRef}
          className="relative aspect-[2/3] w-full max-w-[280px] origin-left"
          style={{ transformStyle: "preserve-3d" }}
          animate={
            opening
              ? { rotateY: -105, opacity: 0.85 }
              : reduceMotion
                ? { rotateX: 0, rotateY: 0 }
                : { rotateX: tilt.x, rotateY: tilt.y }
          }
          transition={
            opening
              ? {
                  duration: motionTokens.duration.intro,
                  ease: motionTokens.ease.paper,
                }
              : { type: "spring", stiffness: 220, damping: 26 }
          }
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-r-lg rounded-l-md border border-ink/10 px-8 text-center"
            style={{
              backgroundColor: "#DDD3F1",
              boxShadow: `
                3px 0 0 rgb(48 44 53 / 0.06),
                6px 0 0 rgb(48 44 53 / 0.04),
                10px 16px 36px rgb(48 44 53 / 0.18)
              `,
              backfaceVisibility: "hidden",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-ink/20 to-transparent"
            />
            <Image
              src="/logo.png"
              alt=""
              width={120}
              height={120}
              priority
              className="relative z-[1] h-24 w-auto object-contain"
            />
            <div className="relative z-[1]">
              <p className="font-display text-2xl font-semibold tracking-tight text-ink">
                {SITE_NAME}
              </p>
              <p className="mt-2 text-sm text-ink-muted">Read. Meet. Bla bla.</p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={openBook}
            disabled={opening}
          >
            {openLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={skip}
            disabled={opening}
          >
            {skipLabel}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
