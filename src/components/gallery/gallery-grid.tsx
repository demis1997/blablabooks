"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Lightbox } from "@/components/gallery/lightbox";
import { EmptyState } from "@/components/ui/empty-state";
import type { GalleryImage } from "@/types/database";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  images: GalleryImage[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const t = useTranslations("Gallery");
  const locale = useLocale();
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
    <div>
      {years.length > 1 ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <label htmlFor="gallery-year" className="text-sm text-ink-muted">
            {t("filterYear")}
          </label>
          <select
            id="gallery-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-10 rounded-xl border border-ink/15 bg-paper px-3 text-sm"
          >
            <option value="all">{t("allYears")}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((image) => {
          const caption =
            locale === "ru"
              ? image.caption_ru?.trim() || image.caption_en
              : image.caption_en?.trim() || image.caption_ru;
          return (
            <li key={image.id} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(images.findIndex((i) => i.id === image.id))
                }
                className={cn(
                  "group block w-full overflow-hidden rounded-2xl bg-paper text-left shadow-soft ring-1 ring-ink/5",
                )}
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={image.public_url}
                    alt={image.alt_text || caption || "Gallery photo"}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </span>
                {(caption || image.event_date || image.location) && (
                  <span className="block px-3 py-2.5">
                    {caption ? (
                      <span className="block text-sm font-medium text-ink">
                        {caption}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {[image.event_date, image.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                )}
              </button>
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
  );
}
