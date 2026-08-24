"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/types/database";
import { motionTokens } from "@/lib/motion/tokens";
import { isInstagramMediaUrl } from "@/lib/instagram";
import { cn } from "@/lib/utils";

type LightboxProps = {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

function captionFor(image: GalleryImage, locale: string) {
  if (locale === "ru") {
    return image.caption_ru?.trim() || image.caption_en;
  }
  return image.caption_en?.trim() || image.caption_ru;
}

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const t = useTranslations("Gallery.lightbox");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const open = index !== null && images[index];
  const image = open ? images[index!] : null;

  const goPrev = useCallback(() => {
    if (index === null || images.length === 0) return;
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null || images.length === 0) return;
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [goNext, goPrev, index, onClose]);

  if (!image || index === null) return null;

  const caption = captionFor(image, locale);
  const meta = [image.event_date, image.location].filter(Boolean).join(" · ");

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={caption || image.alt_text || "Gallery image"}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
        onClick={onClose}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: motionTokens.duration.fast }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-paper/90 p-2 text-ink shadow-soft"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-paper/90 p-2 text-ink shadow-soft sm:left-6"
          aria-label={t("prev")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-paper/90 p-2 text-ink shadow-soft sm:right-6"
          aria-label={t("next")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <motion.figure
          className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) =>
            setTouchStartX(e.changedTouches[0]?.clientX ?? null)
          }
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartX;
            const delta = endX - touchStartX;
            if (Math.abs(delta) > 50) {
              if (delta > 0) goPrev();
              else goNext();
            }
            setTouchStartX(null);
          }}
          initial={
            reduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.page * 0.55,
            ease: motionTokens.ease.settle,
          }}
        >
          <div className="relative aspect-[4/3] w-full max-h-[75vh] overflow-hidden rounded-sm bg-paper p-3 shadow-soft ring-1 ring-ink/10">
            <motion.div
              layoutId={`gallery-photo-${image.id}`}
              className="relative h-full w-full overflow-hidden bg-cream"
            >
              <Image
                src={image.public_url}
                alt={image.alt_text || caption || "Gallery photo"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
                unoptimized={isInstagramMediaUrl(image.public_url)}
              />
            </motion.div>
          </div>
          {(caption || meta) && (
            <figcaption
              className={cn("mt-4 max-w-xl text-center text-sm text-paper/95")}
            >
              {caption ? <p className="font-medium">{caption}</p> : null}
              {meta ? <p className="mt-1 text-paper/70">{meta}</p> : null}
            </figcaption>
          )}
        </motion.figure>
      </motion.div>
    </AnimatePresence>
  );
}
