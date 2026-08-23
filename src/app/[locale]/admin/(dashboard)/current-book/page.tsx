import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCandidateBooks, getCurrentBook } from "@/lib/data/books";
import { CurrentBookAdmin } from "@/components/admin/current-book-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCurrentBookPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.currentBook" });

  const [current, candidates] = await Promise.all([
    getCurrentBook(),
    getCandidateBooks(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
      <CurrentBookAdmin current={current} candidates={candidates} />
    </div>
  );
}
