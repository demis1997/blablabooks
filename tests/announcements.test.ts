import { describe, expect, it } from "vitest";
import {
  isAnnouncementVisible,
  localizeAnnouncementField,
} from "@/lib/books/announcements";
import type { Announcement } from "@/types/database";

const base: Pick<
  Announcement,
  | "status"
  | "publish_at"
  | "expires_at"
  | "hide_when_expired"
  | "title_en"
  | "title_ru"
  | "description_en"
  | "description_ru"
> = {
  status: "published",
  publish_at: null,
  expires_at: null,
  hide_when_expired: true,
  title_en: "Meetup EN",
  title_ru: "Встреча RU",
  description_en: "English description",
  description_ru: "Русское описание",
};

describe("isAnnouncementVisible", () => {
  const now = new Date("2026-08-15T12:00:00.000Z");

  it("hides drafts", () => {
    expect(
      isAnnouncementVisible({ ...base, status: "draft" }, now),
    ).toBe(false);
  });

  it("hides before publish_at", () => {
    expect(
      isAnnouncementVisible(
        { ...base, publish_at: "2026-09-01T00:00:00.000Z" },
        now,
      ),
    ).toBe(false);
  });

  it("shows after publish_at when not expired", () => {
    expect(
      isAnnouncementVisible(
        {
          ...base,
          publish_at: "2026-08-01T00:00:00.000Z",
          expires_at: "2026-09-01T00:00:00.000Z",
        },
        now,
      ),
    ).toBe(true);
  });

  it("hides expired announcements when hide_when_expired is true", () => {
    expect(
      isAnnouncementVisible(
        {
          ...base,
          expires_at: "2026-08-01T00:00:00.000Z",
          hide_when_expired: true,
        },
        now,
      ),
    ).toBe(false);
  });

  it("keeps expired announcements visible when hide_when_expired is false", () => {
    expect(
      isAnnouncementVisible(
        {
          ...base,
          expires_at: "2026-08-01T00:00:00.000Z",
          hide_when_expired: false,
        },
        now,
      ),
    ).toBe(true);
  });
});

describe("localizeAnnouncementField", () => {
  it("prefers RU then falls back to EN", () => {
    expect(localizeAnnouncementField(base, "ru", "title")).toBe("Встреча RU");
    expect(
      localizeAnnouncementField(
        { ...base, title_ru: null },
        "ru",
        "title",
      ),
    ).toBe("Meetup EN");
  });

  it("prefers EN then falls back to RU", () => {
    expect(localizeAnnouncementField(base, "en", "description")).toBe(
      "English description",
    );
    expect(
      localizeAnnouncementField(
        { ...base, description_en: "  " },
        "en",
        "description",
      ),
    ).toBe("Русское описание");
  });
});
