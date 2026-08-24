"use client";

import { CalendarPlus, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { localizeAnnouncementField } from "@/lib/books/announcements";
import { buildGoogleCalendarUrl } from "@/lib/meetups";
import { motionTokens } from "@/lib/motion/tokens";
import type { Locale } from "@/lib/constants";
import type { Announcement } from "@/types/database";
import { PaperPocket } from "./paper-pocket";
import { SectionBook } from "./section-book";
import { useBookOpen } from "./use-book-open";

type MeetupDiaryProps = {
  announcement: Announcement;
  locale: Locale;
};

export function MeetupDiary({ announcement, locale }: MeetupDiaryProps) {
  const t = useTranslations("Home");
  const reduceMotion = useReducedMotion();
  const { ref, open } = useBookOpen(0.3);

  const title = localizeAnnouncementField(announcement, locale, "title");
  const description = localizeAnnouncementField(
    announcement,
    locale,
    "description",
  );

  const event = announcement.event_date
    ? new Date(`${announcement.event_date}T12:00:00`)
    : null;
  const dateLabel = event
    ? new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(event)
    : null;
  const timeLabel =
    announcement.start_time &&
    [announcement.start_time.slice(0, 5), announcement.end_time?.slice(0, 5)]
      .filter(Boolean)
      .join(" – ");
  const calendarUrl = buildGoogleCalendarUrl(announcement, title);
  const place = [announcement.venue, announcement.city, announcement.address]
    .filter(Boolean)
    .join(" · ");
  const day = event?.getDate() ?? null;
  const monthTab = event
    ? new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
        month: "short",
      }).format(event)
    : null;

  const daysInMonth = event
    ? new Date(event.getFullYear(), event.getMonth() + 1, 0).getDate()
    : 28;

  return (
    <div ref={ref} className="relative">
      <motion.span
        aria-hidden
        className="elastic-strap pointer-events-none absolute left-[12%] top-4 z-30 hidden h-8 w-[76%] rounded-full lg:block"
        initial={reduceMotion ? false : { x: 0, opacity: 1 }}
        animate={
          reduceMotion || open ? { x: "130%", opacity: 0 } : { x: 0, opacity: 1 }
        }
        transition={{
          duration: motionTokens.duration.page,
          ease: motionTokens.ease.paper,
          delay: 0.2,
        }}
      />
      <SectionBook
        accent="butter"
        binding="diary"
        size="diary"
        entrance="drop"
        thickness="thin"
        coverTitle={t("nextMeetup")}
        coverSubtitle={monthTab ?? undefined}
        left={
          <div className="py-1">
            <p className="font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
              {monthTab}
            </p>
            <h2 className="mt-2 font-display text-2xl text-ink">{title}</h2>
            <div className="relative mt-5 grid grid-cols-7 gap-1 font-display text-[11px] text-ink-muted">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((n) => (
                <span
                  key={n}
                  className="relative flex h-7 items-center justify-center"
                >
                  {n}
                  {day === n ? (
                    <motion.svg
                      aria-hidden
                      className="pointer-events-none absolute inset-0 text-blush"
                      viewBox="0 0 28 28"
                      fill="none"
                      initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.35 }}
                    >
                      <motion.circle
                        cx="14"
                        cy="14"
                        r="11"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </motion.svg>
                  ) : null}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm text-ink-muted">
              {dateLabel ? <p>{dateLabel}</p> : null}
              {timeLabel ? <p>{timeLabel}</p> : null}
            </div>
            {description ? (
              <p className="mt-4 font-display text-sm italic leading-relaxed text-ink">
                {description}
              </p>
            ) : null}
          </div>
        }
        right={
          <div className="flex h-full flex-col justify-center gap-4 py-2">
            {place || announcement.maps_url ? (
              <PaperPocket label={t("mapPocket")}>
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
              </PaperPocket>
            ) : null}
            {calendarUrl ? (
              <div className="ticket-stub mx-1 overflow-hidden rounded-md border border-dashed border-ink/20 px-5 py-4">
                <p className="font-display text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {t("ticket")}
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
    </div>
  );
}
