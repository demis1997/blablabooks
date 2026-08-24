import { getTranslations, setRequestLocale } from "next-intl/server";
import { listAnnouncements } from "@/lib/data/announcements";
import { AnnouncementsAdmin } from "@/components/admin/announcements-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminMeetupsPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const announcements = await listAnnouncements({ includeHidden: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("nav.meetups")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("meetups.hint")}</p>
      </div>
      <AnnouncementsAdmin announcements={announcements} mode="meetups" />
    </div>
  );
}
