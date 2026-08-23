import { CalendarPlus, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { localizeAnnouncementField } from "@/lib/books/announcements";
import type { Locale } from "@/lib/constants";
import type { Announcement } from "@/types/database";

type MeetupCardProps = {
  announcement: Announcement;
  locale: Locale;
};

function buildGoogleCalendarUrl(announcement: Announcement, title: string) {
  if (!announcement.event_date) return null;
  const start = (announcement.start_time ?? "18:00").replace(":", "");
  const end = (announcement.end_time ?? "20:00").replace(":", "");
  const day = announcement.event_date.replace(/-/g, "");
  const dates = `${day}T${start}00/${day}T${end}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    details: announcement.description_en ?? "",
    location:
      [announcement.venue, announcement.address].filter(Boolean).join(", ") ||
      "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function MeetupCard({ announcement, locale }: MeetupCardProps) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const title = localizeAnnouncementField(announcement, locale, "title");
  const description = localizeAnnouncementField(
    announcement,
    locale,
    "description",
  );

  const dateLabel = announcement.event_date
    ? new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${announcement.event_date}T12:00:00`))
    : null;

  const timeLabel =
    announcement.start_time &&
    [
      announcement.start_time.slice(0, 5),
      announcement.end_time?.slice(0, 5),
    ]
      .filter(Boolean)
      .join(" – ");

  const calendarUrl = buildGoogleCalendarUrl(announcement, title);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading title={t("nextMeetup")} />
      <article className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-powder/40 via-paper to-blush/30 p-6 shadow-soft ring-1 ring-ink/5 sm:p-8 md:p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
          {announcement.announcement_type}
        </p>
        <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
          {title}
        </h3>
        <div className="mt-4 flex flex-col gap-2 text-ink-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
          {dateLabel ? <span>{dateLabel}</span> : null}
          {timeLabel ? <span>{timeLabel}</span> : null}
          {announcement.venue || announcement.address ? (
            <span className="inline-flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {[announcement.venue, announcement.address]
                .filter(Boolean)
                .join(" · ")}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink">
            {description}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap gap-3">
          {announcement.maps_url ? (
            <Button asChild>
              <a
                href={announcement.maps_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("openMaps")}
              </a>
            </Button>
          ) : null}
          {calendarUrl ? (
            <Button asChild variant="outline">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="h-4 w-4" />
                {t("addToCalendar")}
              </a>
            </Button>
          ) : null}
        </div>
      </article>
    </section>
  );
}
