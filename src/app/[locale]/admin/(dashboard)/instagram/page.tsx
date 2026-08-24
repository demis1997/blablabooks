import { setRequestLocale } from "next-intl/server";
import { listGalleryImages } from "@/lib/data/gallery";
import { getInstagramPublicStatus, getInstagramSyncLogs } from "@/lib/data/instagram";
import { getSiteSettings } from "@/lib/data/settings";
import { isInstagramOAuthConfigured } from "@/lib/instagram/oauth";
import { getAdminSession, sessionIsOwner } from "@/lib/supabase/auth";
import { InstagramAdmin } from "@/components/admin/instagram-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminInstagramPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const [connection, images, logs, settings, session] = await Promise.all([
    getInstagramPublicStatus(),
    listGalleryImages({ includeUnpublished: true }),
    getInstagramSyncLogs(),
    getSiteSettings(),
    getAdminSession(),
  ]);

  return (
    <InstagramAdmin
      locale={locale}
      connection={connection}
      oauthConfigured={isInstagramOAuthConfigured()}
      images={images}
      logs={logs}
      settings={settings}
      isOwner={session ? sessionIsOwner(session) : false}
    />
  );
}
