import { NextResponse } from "next/server";
import { getAnnouncementById } from "@/lib/data/announcements";
import { buildIcs } from "@/lib/meetups";
import { isAnnouncementVisible } from "@/lib/books/announcements";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const announcement = await getAnnouncementById(id);
  if (
    !announcement ||
    !isAnnouncementVisible(announcement) ||
    announcement.announcement_type !== "meetup"
  ) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const title = announcement.title_en;
  const body = buildIcs(announcement, title);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bla-bla-books-meetup.ics"`,
    },
  });
}
