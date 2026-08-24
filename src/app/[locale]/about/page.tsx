import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClubJournal } from "@/components/library/club-journal";
import { PaperTexture } from "@/components/book/paper-texture";
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
    <ClubJournal>
        <h1 className="mb-8 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {/* Ex libris bookplate */}
        <div className="ex-libris relative mx-auto mb-10 max-w-sm overflow-hidden rounded-sm border-2 border-double border-ink/25 bg-paper px-6 py-5 text-center shadow-[var(--shadow-soft)]">
          <PaperTexture className="opacity-[0.05]" />
          <div className="relative z-[1]">
            <p className="font-display text-[10px] uppercase tracking-[0.25em] text-ink-muted">
              {t("bookplate")}
            </p>
            <div className="mx-auto mt-3 flex justify-center">
              <Image
                src="/logo.png"
                alt=""
                width={64}
                height={64}
                className="h-14 w-auto object-contain opacity-90"
              />
            </div>
            <p className="mt-3 font-display text-sm italic leading-snug text-ink">
              {t("belongsTo")}
            </p>
          </div>
        </div>

        <div className="relative lg:pr-36">
          <article
            className="prose-bla about-dropcap columns-1 gap-8 text-ink md:columns-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* margin annotation — bilingual tip */}
          <aside
            className="margin-note mt-8 max-w-xs font-display text-sm italic text-ink-muted lg:absolute lg:right-0 lg:top-4 lg:mt-0 lg:w-32 lg:rotate-[-2deg]"
            aria-label={t("languages")}
          >
            <span
              aria-hidden
              className="mb-1 block h-px w-8 bg-ink/20 lg:mx-0"
            />
            {t("bilingualNote")}
          </aside>
        </div>
    </ClubJournal>
  );
}
