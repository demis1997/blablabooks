import { describe, expect, it } from "vitest";
import {
  instagramImageUrl,
  mapInstagramMediaToGallery,
} from "@/lib/instagram";

describe("instagram gallery mapping", () => {
  it("uses media_url for images and thumbnail for video", () => {
    expect(
      instagramImageUrl({
        id: "1",
        media_type: "IMAGE",
        media_url: "https://example.com/a.jpg",
      }),
    ).toBe("https://example.com/a.jpg");
    expect(
      instagramImageUrl({
        id: "2",
        media_type: "VIDEO",
        media_url: "https://example.com/a.mp4",
        thumbnail_url: "https://example.com/a.jpg",
      }),
    ).toBe("https://example.com/a.jpg");
  });

  it("maps posts to gallery images and skips items without urls", () => {
    const images = mapInstagramMediaToGallery([
      {
        id: "10",
        caption: "Meetup",
        media_type: "IMAGE",
        media_url: "https://example.com/10.jpg",
        timestamp: "2026-09-01T18:00:00+0000",
        permalink: "https://www.instagram.com/p/abc/",
      },
      { id: "11", media_type: "IMAGE" },
    ]);
    expect(images).toHaveLength(1);
    expect(images[0]?.id).toBe("ig-10");
    expect(images[0]?.public_url).toBe("https://example.com/10.jpg");
    expect(images[0]?.event_date).toBe("2026-09-01");
    expect(images[0]?.status).toBe("published");
  });
});
