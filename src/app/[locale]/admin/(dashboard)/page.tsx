import { getTranslations, setRequestLocale } from "next-intl/server";
import { getOverviewStats } from "@/lib/data/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOverviewPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const stats = await getOverviewStats();

  const cards = [
    { label: t("stats.totalBooks"), value: stats.totalBooks },
    { label: t("stats.candidates"), value: stats.candidates },
    { label: t("stats.currentlyReading"), value: stats.currentlyReading },
    { label: t("stats.previouslyRead"), value: stats.previouslyRead },
    { label: t("stats.announcements"), value: stats.announcements },
    { label: t("stats.galleryImages"), value: stats.gallery },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("overview")}</h1>
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
              <p className="font-display text-3xl text-ink">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="font-display text-xl text-ink">
          {t("stats.recentActivity")}
        </h2>
        <ul className="mt-4 divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-paper">
          {stats.activity.length === 0 ? (
            <li className="p-4 text-sm text-ink-muted">—</li>
          ) : (
            stats.activity.map((entry) => (
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
