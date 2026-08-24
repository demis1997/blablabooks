import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminOverview } from "@/lib/data/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOverviewPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const overview = await getAdminOverview();

  const cards = [
    {
      label: t("stats.currentlyReading"),
      value: overview.currentBook?.title ?? "—",
    },
    {
      label: t("stats.nextMeetup"),
      value: overview.nextMeetup?.title_en ?? "—",
    },
    { label: t("stats.candidates"), value: overview.counts.candidates },
    {
      label: t("stats.publishedGallery"),
      value: overview.counts.publishedGallery,
    },
    {
      label: t("stats.instagram"),
      value: overview.instagram?.username
        ? `@${overview.instagram.username}`
        : t("instagram.notConnected"),
    },
    {
      label: t("stats.lastIgSync"),
      value: overview.instagram?.last_synced_at
        ? new Date(overview.instagram.last_synced_at).toLocaleString(locale)
        : "—",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("overview")}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/admin/books/new">{t("quick.addBook")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/current-book">{t("quick.selectBook")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/meetups">{t("quick.createMeetup")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/instagram">{t("quick.importIg")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans font-medium text-ink-muted">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl text-ink break-words">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="font-display text-xl text-ink">
          {t("stats.recentActivity")}
        </h2>
        <ul className="mt-4 divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-paper">
          {overview.recentActivity.length === 0 ? (
            <li className="p-4 text-sm text-ink-muted">—</li>
          ) : (
            overview.recentActivity.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium text-ink">{entry.action}</span>
                <span className="text-ink-muted">
                  {new Date(entry.created_at).toLocaleString(locale)}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
