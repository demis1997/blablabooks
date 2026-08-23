import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RandomizerExperience } from "@/components/randomizer/randomizer-experience";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCandidateBooks } from "@/lib/data/books";
import { getSiteSettings } from "@/lib/data/settings";
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
  const t = await getTranslations({ locale, namespace: "Randomizer" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function RandomizerPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const [settings, candidates] = await Promise.all([
    getSiteSettings(),
    getCandidateBooks(),
  ]);
  const t = await getTranslations({ locale, namespace: "Randomizer" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        title={t("title")}
        description={t("subtitle")}
        align="center"
        className="mx-auto"
      />

      <div className="mt-12">
        {!settings.public_randomizer_enabled ? (
          <EmptyState
            title={t("publicDisabled")}
            description={t("adminOnly")}
          />
        ) : (
          <RandomizerExperience
            eligibleBooks={candidates}
            displayOnly
          />
        )}
      </div>
    </div>
  );
}
