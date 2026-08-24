import { localizeAnnouncementField } from "@/lib/books/announcements";
import type { Locale } from "@/lib/constants";
import type { Announcement } from "@/types/database";

export function AnnouncementBanner({
  announcement,
  locale,
}: {
  announcement: Announcement;
  locale: Locale;
}) {
  const title = localizeAnnouncementField(announcement, locale, "title");
  const body = localizeAnnouncementField(announcement, locale, "description");

  return (
    <div className="mx-4 mb-2 rounded-2xl border border-ink/10 bg-butter/70 px-4 py-3 text-sm text-ink sm:mx-6">
      <p className="font-display text-base">{title}</p>
      {body ? <p className="mt-1 text-ink-muted">{body}</p> : null}
    </div>
  );
}
