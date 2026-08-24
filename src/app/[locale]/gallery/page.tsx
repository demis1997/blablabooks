import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { ScrapbookFrame } from "@/components/library/scrapbook-frame";
import { listGalleryImages } from "@/lib/data/gallery";
import { INSTAGRAM_URL, type Locale } from "@/lib/constants";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Gallery" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function GalleryPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const images = await listGalleryImages();
  const t = await getTranslations({ locale, namespace: "Gallery" });
  const fromInstagram = images.some((img) => img.source === "instagram");

  return (
    <ScrapbookFrame
      kicker={fromInstagram ? t("fromInstagram") : t("title")}
      title={t("subtitle")}
      hint={
        <>
          {t("instagramHint")}{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline decoration-blush/80 underline-offset-4 hover:decoration-ink"
          >
            {t("openInstagram")}
          </a>
        </>
      }
    >
      <GalleryGrid images={images} />
    </ScrapbookFrame>
  );
}
