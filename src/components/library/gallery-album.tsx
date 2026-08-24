"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Lightbox } from "@/components/gallery/lightbox";
import { PhotoScrap } from "@/components/book/photo-scrap";
import { Button } from "@/components/ui/button";
import { motionTokens } from "@/lib/motion/tokens";
import type { Locale } from "@/lib/constants";
import type { GalleryImage } from "@/types/database";
import { SectionBook } from "./section-book";
import { useBookOpen } from "./use-book-open";

type GalleryAlbumProps = {
  images: GalleryImage[];
  locale: Locale;
};

const ROTATIONS = [-3.5, 2.2, -1.5, 3, -2.4, 1.8] as const;
const TAPES = [
  "blush",
  "powder",
  "lavender",
  "sage",
  "butter",
  "blush",
] as const;

export function GalleryAlbum({ images, locale }: GalleryAlbumProps) {
  const t = useTranslations("Home");
  const reduceMotion = useReducedMotion();
  const { ref } = useBookOpen(0.2);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const preview = images.slice(0, 6);

  if (preview.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <span aria-hidden className="album-corner left-3 top-3 hidden lg:block" />
      <span
        aria-hidden
        className="album-corner right-3 top-3 hidden rotate-90 lg:block"
      />
      <SectionBook
        accent="sage"
        binding="album"
        size="album"
        entrance="fromLeft"
        thickness="thick"
        pageTone="bg-[#f3eee6]"
        coverTitle={t("recentGallery")}
        coverSubtitle={t("viewAllGallery")}
        left={
          <div className="flex h-full flex-col justify-center gap-4 py-2">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t("recentGallery")}
            </h2>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/gallery">{t("viewAllGallery")}</Link>
            </Button>
          </div>
        }
        right={
          <ul className="grid grid-cols-2 gap-4 py-2 sm:gap-5">
            {preview.slice(0, 4).map((image, index) => {
              const caption =
                locale === "ru"
                  ? image.caption_ru?.trim() || image.caption_en
                  : image.caption_en?.trim() || image.caption_ru;
              return (
                <li key={image.id}>
                  <motion.button
                    type="button"
                    className="block w-full text-left focus-visible:outline-none"
                    initial={reduceMotion ? false : { opacity: 0, y: 18, rotate: 8 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: motionTokens.duration.page,
                      ease: motionTokens.ease.paper,
                      delay: 0.08 * index,
                    }}
                    onClick={() =>
                      setActiveIndex(images.findIndex((x) => x.id === image.id))
                    }
                  >
                    <PhotoScrap
                      src={image.public_url}
                      alt={image.alt_text || caption || "Gallery photo"}
                      caption={caption}
                      rotate={ROTATIONS[index] ?? -2}
                      tapeTone={TAPES[index] ?? "blush"}
                      sizes="(max-width: 640px) 40vw, 180px"
                    />
                  </motion.button>
                </li>
              );
            })}
          </ul>
        }
      />
      <Lightbox
        images={images}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}
