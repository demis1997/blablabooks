import { getTranslations, setRequestLocale } from "next-intl/server";
import { listGalleryImages } from "@/lib/data/gallery";
import { GalleryAdmin } from "@/components/admin/gallery-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminGalleryPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const images = await listGalleryImages({ includeUnpublished: true });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">{t("nav.gallery")}</h1>
      <GalleryAdmin images={images} />
    </div>
  );
}
