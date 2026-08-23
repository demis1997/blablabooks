import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCandidateBooks } from "@/lib/data/books";
import { listDraws } from "@/lib/data/draws";
import { AdminRandomizerClient } from "@/components/admin/admin-randomizer-client";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminRandomizerPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.randomizer" });

  const [candidates, history] = await Promise.all([
    getCandidateBooks(),
    listDraws(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
      <AdminRandomizerClient candidates={candidates} history={history} />
    </div>
  );
}
