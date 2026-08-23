import type { Announcement } from "@/types/database";
import type { Locale } from "@/lib/constants";

/**
 * Mirrors SQL `announcement_is_public`:
 * published AND (publish_at is null OR publish_at <= now)
 * AND (expires_at is null OR expires_at > now OR hide_when_expired = false)
 */
export function isAnnouncementVisible(
  announcement: Pick<
    Announcement,
    "status" | "publish_at" | "expires_at" | "hide_when_expired"
  >,
  now: Date = new Date(),
): boolean {
  if (announcement.status !== "published") return false;

  if (announcement.publish_at) {
    const publishAt = new Date(announcement.publish_at);
    if (publishAt.getTime() > now.getTime()) return false;
  }

  if (announcement.expires_at) {
    const expiresAt = new Date(announcement.expires_at);
    if (
      expiresAt.getTime() <= now.getTime() &&
      announcement.hide_when_expired
    ) {
      return false;
    }
  }

  return true;
}

type LocalizableField = "title" | "description";

/**
 * Resolve EN/RU announcement fields with locale preference and fallback.
 */
export function localizeAnnouncementField(
  announcement: Pick<
    Announcement,
    "title_en" | "title_ru" | "description_en" | "description_ru"
  >,
  locale: Locale,
  field: LocalizableField,
): string {
  if (field === "title") {
    if (locale === "ru") {
      return announcement.title_ru?.trim() || announcement.title_en;
    }
    return announcement.title_en || announcement.title_ru?.trim() || "";
  }

  if (locale === "ru") {
    return (
      announcement.description_ru?.trim() ||
      announcement.description_en?.trim() ||
      ""
    );
  }

  return (
    announcement.description_en?.trim() ||
    announcement.description_ru?.trim() ||
    ""
  );
}
