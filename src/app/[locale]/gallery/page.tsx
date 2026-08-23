import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { BookShell } from "@/components/book/book-shell";
import { BookPage } from "@/components/book/book-page";
import { HandDrawnUnderline } from "@/components/book/hand-drawn-underline";
import { listGalleryImages } from "@/lib/data/gallery";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/constants";

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

  return (
    <BookShell>
      <BookPage chapterTitle={t("title")} pageNumber="ii" side="left">
        {/* scrapbook title spread */}
        <header className="relative mb-10 max-w-xl">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
            {t("title")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("subtitle")}
          </h1>
          <HandDrawnUnderline className="mt-3 max-w-[10rem] text-blush" />
          <span
            aria-hidden
            className="washi-tape absolute -right-2 -top-3 hidden h-3 w-14 rotate-12 sm:block"
          />
        </header>
        <GalleryGrid images={images} />
      </BookPage>
    </BookShell>
  );
}
