import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/constants";
import type { GalleryImage } from "@/types/database";

type GalleryPreviewProps = {
  images: GalleryImage[];
  locale: Locale;
};

export async function GalleryPreview({ images, locale }: GalleryPreviewProps) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const preview = images.slice(0, 8);

  if (preview.length === 0) return null;

  return (
    <section className="border-y border-ink/5 bg-lavender/15">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("recentGallery")} />
          <Button asChild variant="ghost">
            <Link href="/gallery">{t("viewAllGallery")}</Link>
          </Button>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {preview.map((image, index) => {
            const caption =
              locale === "ru"
                ? image.caption_ru?.trim() || image.caption_en
                : image.caption_en?.trim() || image.caption_ru;
            return (
              <li
                key={image.id}
                className={`overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-ink/5 ${
                  index === 0 ? "sm:col-span-1 sm:row-span-1" : ""
                }`}
              >
                <Link
                  href="/gallery"
                  className="group relative block aspect-[4/3] overflow-hidden"
                >
                  <Image
                    src={image.public_url}
                    alt={image.alt_text || caption || "Gallery photo"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-safe:group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
