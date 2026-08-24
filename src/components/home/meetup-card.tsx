"use client";

import { CalendarPlus, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookSpread } from "@/components/book/book-spread";
import { PaperCard } from "@/components/book/paper-card";
import { Button } from "@/components/ui/button";
import { localizeAnnouncementField } from "@/lib/books/announcements";
import { buildGoogleCalendarUrl } from "@/lib/meetups";
import { motionTokens } from "@/lib/motion/tokens";
import type { Locale } from "@/lib/constants";
import type { Announcement } from "@/types/database";

type MeetupCardProps = {
  announcement: Announcement;
  locale: Locale;
};

export function MeetupCard({ announcement, locale }: MeetupCardProps) {
  const t = useTranslations("Home");
  const tBook = useTranslations("BookExperience");
  const reduceMotion = useReducedMotion();

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
    [announcement.start_time.slice(0, 5), announcement.end_time?.slice(0, 5)]
      .filter(Boolean)
      .join(" – ");

  const calendarUrl = buildGoogleCalendarUrl(announcement, title);
  const place = [announcement.venue, announcement.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <BookSpread
      chapter={tBook("chapterMeetup")}
      pageStart={5}
      className="rounded-none border-0 border-t border-ink/8 shadow-none bg-transparent"
      left={
        <div className="relative overflow-hidden py-4">
          <div
            aria-hidden
            className="absolute inset-x-6 bottom-0 h-16 rounded-t-md bg-ink/5"
          />
          <motion.div
            initial={reduceMotion ? false : { y: 72, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: motionTokens.duration.page,
              ease: motionTokens.ease.paper,
            }}
          >
            <PaperCard rotate={-1.2} className="p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                {announcement.announcement_type}
              </p>
              <h3 className="mt-2 font-display text-2xl text-ink">{title}</h3>
              <div className="mt-4 space-y-1.5 text-sm text-ink-muted">
                {dateLabel ? <p>{dateLabel}</p> : null}
                {timeLabel ? <p>{timeLabel}</p> : null}
              </div>
              {description ? (
                <p className="mt-4 text-sm leading-relaxed text-ink">
                  {description}
                </p>
              ) : null}
            </PaperCard>
          </motion.div>
        </div>
      }
      right={
        <div className="flex h-full flex-col justify-center gap-4 py-4">
          {place || announcement.maps_url ? (
            <div className="relative">
              <span
                aria-hidden
                className="absolute -top-2 left-4 z-[2] rounded-sm bg-powder px-3 py-1 font-display text-xs font-semibold text-ink shadow-sm"
              >
                Map
              </span>
              <PaperCard rotate={0.8} className="p-4 pt-6">
                {place ? (
                  <p className="inline-flex items-start gap-1.5 text-sm text-ink">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {place}
                  </p>
                ) : null}
                {announcement.maps_url ? (
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <a
                        href={announcement.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("openMaps")}
                      </a>
                    </Button>
                  </div>
                ) : null}
              </PaperCard>
            </div>
          ) : null}

          {calendarUrl ? (
            <div className="ticket-stub mx-1 overflow-hidden rounded-md border border-dashed border-ink/20 px-5 py-4 shadow-sm">
              <p className="font-display text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Ticket
              </p>
              <p className="mt-1 text-sm text-ink">
                {[dateLabel, timeLabel].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    {t("addToCalendar")}
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={`/api/meetups/${announcement.id}/ics`}>
                    {t("downloadIcs")}
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      }
    />
  );
}
