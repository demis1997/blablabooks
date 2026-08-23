"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BookSpread } from "@/components/book/book-spread";
import { PhotoScrap } from "@/components/book/photo-scrap";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/constants";
import type { GalleryImage } from "@/types/database";

type GalleryPreviewProps = {
  images: GalleryImage[];
  locale: Locale;
};

const ROTATIONS = [-3.5, 2.2, -1.5, 3, -2.4, 1.8, -3, 2.6] as const;
const TAPES = [
  "blush",
  "powder",
  "lavender",
  "sage",
  "butter",
  "blush",
  "powder",
  "sage",
] as const;

export function GalleryPreview({ images, locale }: GalleryPreviewProps) {
  const t = useTranslations("Home");
  const tBook = useTranslations("BookExperience");
  const preview = images.slice(0, 8);

  if (preview.length === 0) return null;

  return (
    <BookSpread
      chapter={tBook("chapterGallery")}
      pageStart={9}
      className="rounded-none border-0 border-t border-ink/8 shadow-none bg-transparent"
      left={
        <div className="flex h-full flex-col justify-center gap-4 py-2">
          <h3 className="font-display text-2xl text-ink sm:text-3xl">
            {t("recentGallery")}
          </h3>
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
                <Link href="/gallery" className="block focus-visible:outline-none">
                  <PhotoScrap
                    src={image.public_url}
                    alt={image.alt_text || caption || "Gallery photo"}
                    caption={caption}
                    rotate={ROTATIONS[index] ?? -2}
                    tapeTone={TAPES[index] ?? "blush"}
                    sizes="(max-width: 640px) 40vw, 180px"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      }
    />
  );
}
