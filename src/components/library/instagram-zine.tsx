"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { StampBadge } from "@/components/book/stamp-badge";
import { Instagram } from "@/components/brand/decorative";
import { Button } from "@/components/ui/button";
import { HandDrawnUnderline } from "@/components/book/hand-drawn-underline";
import { INSTAGRAM_URL } from "@/lib/constants";
import { motionTokens } from "@/lib/motion/tokens";
import { isInstagramMediaUrl } from "@/lib/instagram";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/database";
import { SectionBook } from "./section-book";

type InstagramZineProps = {
  href?: string;
  photos?: GalleryImage[];
};

export function InstagramZine({
  href = INSTAGRAM_URL,
  photos = [],
}: InstagramZineProps) {
  const t = useTranslations("Home");
  const reduceMotion = useReducedMotion();
  const collage = photos.filter((p) => p.source === "instagram").slice(0, 4);
  const fallback = collage.length ? collage : photos.slice(0, 4);

  return (
    <SectionBook
      accent="lavender"
      binding="zine"
      size="zine"
      entrance="spin"
      thickness="thin"
      coverTitle="@bla.bla.books.cy"
      coverSubtitle={t("instagramCta.title")}
      left={
        <div className="py-2">
          <StampBadge tone="blush">@bla.bla.books.cy</StampBadge>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink">
            {t("instagramCta.title")}
          </h2>
          <HandDrawnUnderline className="mt-2 max-w-[8rem] text-blush" />
          <p className="mt-4 max-w-md font-display text-base italic leading-relaxed text-ink-muted">
            {t("instagramCta.body")}
          </p>
          <div className="mt-6">
            <Button asChild size="lg" variant="secondary">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                {t("instagramCta.button")}
              </a>
            </Button>
          </div>
        </div>
      }
      right={
        <div className="grid grid-cols-2 gap-2 py-2">
          {fallback.length === 0
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-sm bg-blush/40",
                    i % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]",
                  )}
                />
              ))
            : fallback.map((image, i) => (
                <motion.div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-sm border border-ink/10"
                  style={{ rotate: i % 2 === 0 ? -3 : 2 }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: motionTokens.duration.fast,
                    delay: 0.05 * i,
                  }}
                >
                  <Image
                    src={image.public_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized={isInstagramMediaUrl(image.public_url)}
                  />
                </motion.div>
              ))}
        </div>
      }
    />
  );
}
