import { describe, expect, it } from "vitest";
import { flattenInstagramMedia, partitionNewMedia } from "@/lib/instagram/media";
import { isInstagramMediaUrl } from "@/lib/instagram/urls";
import { isAuthorizedCron } from "@/lib/instagram/cron-auth";
import { verifyOAuthState } from "@/lib/instagram/oauth-state";

describe("instagram media flatten", () => {
  it("uses media_url for images and thumbnail for video", () => {
    const drafts = flattenInstagramMedia([
      {
        id: "1",
        media_type: "IMAGE",
        media_url: "https://example.com/a.jpg",
      },
      {
        id: "2",
        media_type: "VIDEO",
        media_url: "https://example.com/a.mp4",
        thumbnail_url: "https://example.com/a.jpg",
      },
    ]);
    expect(drafts.map((d) => d.image_url)).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/a.jpg",
    ]);
  });

  it("expands carousel children and skips items without urls", () => {
    const drafts = flattenInstagramMedia([
      {
        id: "10",
        caption: "Meetup",
        media_type: "CAROUSEL_ALBUM",
        permalink: "https://www.instagram.com/p/abc/",
        children: {
          data: [
            {
              id: "10a",
              media_type: "IMAGE",
              media_url: "https://example.com/10.jpg",
              timestamp: "2026-09-01T18:00:00+0000",
            },
          ],
        },
      },
      { id: "11", media_type: "IMAGE" },
    ]);
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.instagram_media_id).toBe("10a");
    expect(drafts[0]?.permalink).toBe("https://www.instagram.com/p/abc/");
  });

  it("skips duplicates by instagram media id", () => {
    const { fresh, skipped } = partitionNewMedia(
      [
        {
          instagram_media_id: "a",
          image_url: "https://x",
          permalink: null,
          caption: null,
          timestamp: null,
          media_type: "IMAGE",
        },
        {
          instagram_media_id: "b",
          image_url: "https://y",
          permalink: null,
          caption: null,
          timestamp: null,
          media_type: "IMAGE",
        },
      ],
      new Set(["a"]),
    );
    expect(skipped).toBe(1);
    expect(fresh).toHaveLength(1);
    expect(fresh[0]?.instagram_media_id).toBe("b");
  });
});

describe("instagram helpers", () => {
  it("detects instagram cdn urls", () => {
    expect(
      isInstagramMediaUrl("https://scontent.cdninstagram.com/v/t51.1.jpg"),
    ).toBe(true);
    expect(isInstagramMediaUrl("https://example.com/x.jpg")).toBe(false);
  });

  it("authorizes cron only with bearer secret", () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-cron";
    expect(
      isAuthorizedCron(
        new Request("https://x/api/cron/instagram", {
          headers: { authorization: "Bearer test-cron" },
        }),
      ),
    ).toBe(true);
    expect(
      isAuthorizedCron(new Request("https://x/api/cron/instagram")),
    ).toBe(false);
    process.env.CRON_SECRET = prev;
  });

  it("rejects mismatched oauth state", () => {
    expect(verifyOAuthState("a.b.c", "a.b.c", "a")).toBe(true);
    expect(verifyOAuthState("a.b.c", "other", "a")).toBe(false);
    expect(verifyOAuthState("x.b.c", "x.b.c", "a")).toBe(false);
  });
});
