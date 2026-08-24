import { describe, expect, it } from "vitest";
import { pickAnnouncementBanner, pickNextMeetup } from "@/lib/meetups";
import type { Announcement } from "@/types/database";

function meetup(partial: Partial<Announcement>): Announcement {
  return {
    id: "m1",
    title_en: "Meetup",
    title_ru: null,
    description_en: null,
    description_ru: null,
    announcement_type: "meetup",
    event_date: "2026-09-28",
    start_time: "19:00",
    end_time: "21:00",
    venue: "Gin Garden",
    address: null,
    city: "Limassol",
    maps_url: null,
    image_url: null,
    member_instructions: null,
    cancelled: false,
    publish_at: null,
    expires_at: null,
    is_pinned: false,
    status: "published",
    hide_when_expired: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: null,
    ...partial,
  };
}

describe("meetup selection", () => {
  it("picks the next future published meetup", () => {
    const now = new Date("2026-08-01T12:00:00.000Z");
    const next = pickNextMeetup(
      [
        meetup({ id: "past", event_date: "2026-07-01" }),
        meetup({ id: "soon", event_date: "2026-09-28" }),
        meetup({ id: "later", event_date: "2026-10-12" }),
        meetup({ id: "draft", event_date: "2026-09-10", status: "draft" }),
      ],
      now,
    );
    expect(next?.id).toBe("soon");
  });

  it("ignores cancelled meetups", () => {
    const now = new Date("2026-08-01T12:00:00.000Z");
    expect(
      pickNextMeetup(
        [meetup({ cancelled: true, event_date: "2026-09-28" })],
        now,
      ),
    ).toBeNull();
  });

  it("shows a non-meetup banner only", () => {
    const banner = pickAnnouncementBanner([
      meetup({ id: "m" }),
      meetup({
        id: "n",
        announcement_type: "general",
        title_en: "Hello",
        event_date: null,
        start_time: null,
      }),
    ]);
    expect(banner?.id).toBe("n");
  });
});
