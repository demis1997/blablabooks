import { setRequestLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/data/settings";
import { SettingsAdmin } from "@/components/admin/settings-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const settings = await getSiteSettings();

  return <SettingsAdmin settings={settings} />;
}
