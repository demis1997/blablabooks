"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BookSpread } from "@/components/book/book-spread";
import { StampBadge } from "@/components/book/stamp-badge";
import { Instagram } from "@/components/brand/decorative";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_URL, SITE_NAME } from "@/lib/constants";

type InstagramCtaProps = {
  href?: string;
};

export function InstagramCta({ href = INSTAGRAM_URL }: InstagramCtaProps) {
  const t = useTranslations("Home");
  const tBook = useTranslations("BookExperience");

  return (
    <BookSpread
      chapter={tBook("chapterInstagram")}
      pageStart={11}
      className="rounded-none border-0 border-t border-ink/8 shadow-none bg-transparent"
      left={
        <div className="bookmark-ribbon flex h-full flex-col items-center justify-center gap-5 py-8 text-center">
          <Image
            src="/logo.png"
            alt=""
            width={72}
            height={72}
            className="h-16 w-auto object-contain opacity-90"
          />
          <p className="font-display text-sm italic text-ink-muted">
            {SITE_NAME}
          </p>
          <StampBadge tone="powder">@bla.bla.books.cy</StampBadge>
        </div>
      }
      right={
        <div className="flex h-full flex-col justify-center py-4">
          <h3 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {t("instagramCta.title")}
          </h3>
          <p className="mt-4 max-w-md font-display text-base italic leading-relaxed text-ink-muted">
            {t("instagramCta.body")}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                {t("instagramCta.button")}
              </a>
            </Button>
          </div>
        </div>
      }
    />
  );
}
