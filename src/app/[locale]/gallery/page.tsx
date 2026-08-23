import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SectionHeading } from "@/components/ui/section-heading";
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading title={t("title")} description={t("subtitle")} />
      <div className="mt-10">
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
