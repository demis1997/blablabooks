import type { Announcement } from "@/types/database";
import { isAnnouncementVisible } from "@/lib/books/announcements";

function eventStart(announcement: Announcement): number | null {
  if (!announcement.event_date) return null;
  const time = (announcement.start_time ?? "00:00").slice(0, 5);
  return new Date(`${announcement.event_date}T${time}:00`).getTime();
}

export function pickNextMeetup(
  announcements: Announcement[],
  now: Date = new Date(),
): Announcement | null {
  const upcoming = announcements
    .filter((a) => a.announcement_type === "meetup")
    .filter((a) => !a.cancelled)
    .filter((a) => isAnnouncementVisible(a, now))
    .filter((a) => {
      const start = eventStart(a);
      return start != null && start >= now.getTime();
    })
    .sort((a, b) => (eventStart(a) ?? 0) - (eventStart(b) ?? 0));

  return upcoming[0] ?? null;
}

export function isPastMeetup(
  announcement: Announcement,
  now: Date = new Date(),
): boolean {
  if (announcement.announcement_type !== "meetup") return false;
  const start = eventStart(announcement);
  return start != null && start < now.getTime();
}

export function pickAnnouncementBanner(
  announcements: Announcement[],
  now: Date = new Date(),
): Announcement | null {
  const banners = announcements
    .filter((a) => a.announcement_type !== "meetup")
    .filter((a) => !a.cancelled)
    .filter((a) => isAnnouncementVisible(a, now))
    .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
  return banners[0] ?? null;
}

export function buildGoogleCalendarUrl(
  announcement: Announcement,
  title: string,
): string | null {
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
      [announcement.venue, announcement.address, announcement.city]
        .filter(Boolean)
        .join(", ") || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs(announcement: Announcement, title: string): string {
  const day = announcement.event_date?.replace(/-/g, "") ?? "";
  const start = (announcement.start_time ?? "18:00").replace(":", "");
  const end = (announcement.end_time ?? "20:00").replace(":", "");
  const loc = [announcement.venue, announcement.address, announcement.city]
    .filter(Boolean)
    .join(", ");
  const desc = (announcement.description_en ?? "").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bla Bla Books//Meetup//EN",
    "BEGIN:VEVENT",
    `UID:${announcement.id}@blablabooks`,
    `DTSTAMP:${day}T${start}00Z`,
    `DTSTART:${day}T${start}00`,
    `DTEND:${day}T${end}00`,
    `SUMMARY:${title.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
