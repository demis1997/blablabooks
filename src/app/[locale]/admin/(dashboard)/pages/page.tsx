import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAboutPage } from "@/lib/data/pages";
import { PagesAdmin } from "@/components/admin/pages-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPagesPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const page = await getAboutPage();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">{t("nav.pages")}</h1>
      <PagesAdmin page={page} />
    </div>
  );
}
