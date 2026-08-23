import { getTranslations, setRequestLocale } from "next-intl/server";
import { listAnnouncements } from "@/lib/data/announcements";
import { AnnouncementsAdmin } from "@/components/admin/announcements-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnnouncementsPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const announcements = await listAnnouncements({ includeHidden: true });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">
        {t("nav.announcements")}
      </h1>
      <AnnouncementsAdmin announcements={announcements} />
    </div>
  );
}
