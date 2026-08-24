import type { GalleryImage } from "@/types/database";
import { INSTAGRAM_URL } from "@/lib/constants";

export type InstagramMedia = {
  id: string;
  caption?: string | null;
  media_type?: string | null;
  media_url?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  timestamp?: string | null;
};

type InstagramMediaResponse = {
  data?: InstagramMedia[];
  error?: { message?: string };
};

export function isInstagramConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN);
}

export function isInstagramMediaUrl(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return (
      host.includes("cdninstagram.com") ||
      host.includes("fbcdn.net") ||
      host.includes("instagram.com")
    );
  } catch {
    return false;
  }
}

export function instagramImageUrl(item: InstagramMedia): string | null {
  if (item.media_type === "VIDEO") {
    return item.thumbnail_url ?? item.media_url ?? null;
  }
  return item.media_url ?? item.thumbnail_url ?? null;
}

export function mapInstagramMediaToGallery(
  items: InstagramMedia[],
): GalleryImage[] {
  return items
    .map((item, index): GalleryImage | null => {
      const url = instagramImageUrl(item);
      if (!url) return null;
      const caption = item.caption?.trim() || null;
      const created = item.timestamp ?? new Date().toISOString();
      return {
        id: `ig-${item.id}`,
        event_id: null,
        storage_path: item.permalink ?? `${INSTAGRAM_URL}p/${item.id}/`,
        optimized_path: null,
        public_url: url,
        caption_en: caption,
        caption_ru: caption,
        alt_text: caption ?? "Bla Bla Books Instagram photo",
        event_date: created.slice(0, 10),
        location: null,
        sort_order: index,
        is_featured: index === 0,
        status: "published",
        width: null,
        height: null,
        created_at: created,
        updated_at: created,
        uploaded_by: null,
      };
    })
    .filter((img): img is GalleryImage => img !== null);
}

export async function fetchInstagramGallery(
  limit = 24,
): Promise<GalleryImage[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  const userId = process.env.INSTAGRAM_USER_ID ?? "me";
  const fields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
  const url = new URL(`https://graph.instagram.com/${userId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const payload = (await res.json()) as InstagramMediaResponse;
    if (!res.ok || payload.error) {
      console.error(
        "Instagram gallery fetch failed:",
        payload.error?.message ?? res.statusText,
      );
      return [];
    }
    return mapInstagramMediaToGallery(payload.data ?? []);
  } catch (error) {
    console.error("Instagram gallery fetch failed:", error);
    return [];
  }
}
