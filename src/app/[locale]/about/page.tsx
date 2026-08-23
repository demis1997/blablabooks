import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEditablePage } from "@/lib/data/pages";
import { markdownToHtml } from "@/lib/markdown";
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
  const page = await getEditablePage("about");
  const t = await getTranslations({ locale, namespace: "About" });
  const title =
    locale === "ru"
      ? page?.title_ru?.trim() || page?.title_en || t("title")
      : page?.title_en || page?.title_ru?.trim() || t("title");

  return {
    title,
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const page = await getEditablePage("about");
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "About" });
  const title =
    locale === "ru"
      ? page.title_ru?.trim() || page.title_en || t("title")
      : page.title_en || page.title_ru?.trim() || t("title");
  const content =
    locale === "ru"
      ? page.content_ru?.trim() || page.content_en
      : page.content_en || page.content_ru?.trim() || "";

  const html = markdownToHtml(content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading title={title} />
      <article
        className="prose-bla mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
