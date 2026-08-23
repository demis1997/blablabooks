"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Lightbox } from "@/components/gallery/lightbox";
import { EmptyState } from "@/components/ui/empty-state";
import { PaperCard } from "@/components/book/paper-card";
import { motionTokens } from "@/lib/motion/tokens";
import type { GalleryImage } from "@/types/database";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  images: GalleryImage[];
};

/** Deterministic tilt in −3…3° from id so SSR/client match. */
function rotateForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return ((Math.abs(hash) % 61) / 10) - 3;
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const t = useTranslations("Gallery");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [year, setYear] = useState<string>("all");

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const img of images) {
      if (img.event_date) set.add(img.event_date.slice(0, 4));
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [images]);

  const filtered = useMemo(() => {
    if (year === "all") return images;
    return images.filter((img) => img.event_date?.startsWith(year));
  }, [images, year]);

  if (images.length === 0) {
    return <EmptyState title={t("empty")} />;
  }

  return (
    <LayoutGroup>
      <div>
        {years.length > 1 ? (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <label
              htmlFor="gallery-year"
              className="font-display text-sm text-ink-muted"
            >
              {t("filterYear")}
            </label>
            <PaperCard rotate={-0.8} className="rounded-md">
              <select
                id="gallery-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-9 bg-transparent px-3 font-display text-sm focus:outline-none"
              >
                <option value="all">{t("allYears")}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </PaperCard>
          </div>
        ) : null}

        <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {filtered.map((image, i) => {
            const caption =
              locale === "ru"
                ? image.caption_ru?.trim() || image.caption_en
                : image.caption_en?.trim() || image.caption_ru;
            const rotate = rotateForId(image.id);
            const stagger = Math.min(i, 7);

            return (
              <li key={image.id} className="mb-6 break-inside-avoid">
                <motion.button
                  type="button"
                  onClick={() =>
                    setActiveIndex(images.findIndex((x) => x.id === image.id))
                  }
                  className={cn(
                    "group relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  )}
                  style={{ rotate: `${rotate}deg` }}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 18 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: motionTokens.duration.fast,
                    ease: motionTokens.ease.paper,
                    delay: stagger * motionTokens.stagger,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -8, rotate: rotate * 0.4, zIndex: 2 }
                  }
                >
                  {/* washi tape bar */}
                  <span
                    aria-hidden
                    className="washi-tape absolute -top-2 left-1/2 z-10 h-3 w-16 -translate-x-1/2 rounded-sm"
                  />

                  <span className="polaroid-frame relative block overflow-hidden bg-paper p-2.5 pb-10 shadow-[var(--shadow-soft)] ring-1 ring-ink/8">
                    {/* photo corners */}
                    <span aria-hidden className="photo-corner photo-corner-tl" />
                    <span aria-hidden className="photo-corner photo-corner-tr" />
                    <span aria-hidden className="photo-corner photo-corner-bl" />
                    <span aria-hidden className="photo-corner photo-corner-br" />

                    <motion.span
                      layoutId={`gallery-photo-${image.id}`}
                      className="relative block aspect-[4/3] overflow-hidden bg-cream"
                    >
                      <Image
                        src={image.public_url}
                        alt={image.alt_text || caption || "Gallery photo"}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </motion.span>

                    {(caption || image.event_date || image.location) && (
                      <span className="absolute inset-x-2.5 bottom-2 block px-1">
                        {caption ? (
                          <span className="block font-display text-sm font-medium text-ink line-clamp-2">
                            {caption}
                          </span>
                        ) : null}
                        <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-ink-muted">
                          {[image.event_date, image.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    )}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ul>

        <Lightbox
          images={images}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      </div>
    </LayoutGroup>
  );
}
