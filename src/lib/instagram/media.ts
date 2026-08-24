export type InstagramApiMedia = {
  id: string;
  caption?: string | null;
  media_type?: string | null;
  media_url?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  timestamp?: string | null;
  children?: { data?: InstagramApiMedia[] };
};

export type ImportedMediaDraft = {
  instagram_media_id: string;
  image_url: string;
  permalink: string | null;
  caption: string | null;
  timestamp: string | null;
  media_type: string;
};

export function flattenInstagramMedia(
  items: InstagramApiMedia[],
): ImportedMediaDraft[] {
  const drafts: ImportedMediaDraft[] = [];

  for (const item of items) {
    if (item.media_type === "CAROUSEL_ALBUM" && item.children?.data?.length) {
      for (const child of item.children.data) {
        const url =
          child.media_type === "VIDEO"
            ? child.thumbnail_url ?? child.media_url
            : child.media_url ?? child.thumbnail_url;
        if (!url) continue;
        drafts.push({
          instagram_media_id: child.id,
          image_url: url,
          permalink: item.permalink ?? null,
          caption: item.caption ?? null,
          timestamp: child.timestamp ?? item.timestamp ?? null,
          media_type: child.media_type ?? "IMAGE",
        });
      }
      continue;
    }

    const url =
      item.media_type === "VIDEO"
        ? item.thumbnail_url ?? item.media_url
        : item.media_url ?? item.thumbnail_url;
    if (!url) continue;
    drafts.push({
      instagram_media_id: item.id,
      image_url: url,
      permalink: item.permalink ?? null,
      caption: item.caption ?? null,
      timestamp: item.timestamp ?? null,
      media_type: item.media_type ?? "IMAGE",
    });
  }

  return drafts;
}

export function partitionNewMedia(
  drafts: ImportedMediaDraft[],
  existingIds: Set<string>,
): { fresh: ImportedMediaDraft[]; skipped: number } {
  const fresh: ImportedMediaDraft[] = [];
  let skipped = 0;
  for (const draft of drafts) {
    if (existingIds.has(draft.instagram_media_id)) {
      skipped += 1;
    } else {
      fresh.push(draft);
    }
  }
  return { fresh, skipped };
}

export async function fetchAllInstagramMedia(
  accessToken: string,
  userId = "me",
): Promise<InstagramApiMedia[]> {
  const collected: InstagramApiMedia[] = [];
  let next: string | null =
    `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{id,media_type,media_url,thumbnail_url,timestamp}&limit=50&access_token=${encodeURIComponent(accessToken)}`;

  while (next) {
    const res = await fetch(next);
    const json = (await res.json()) as {
      data?: InstagramApiMedia[];
      paging?: { next?: string };
      error?: { message?: string; code?: number };
    };
    if (!res.ok || json.error) {
      const err = new Error(json.error?.message ?? "Instagram media request failed");
      (err as Error & { code?: number }).code = json.error?.code;
      throw err;
    }
    collected.push(...(json.data ?? []));
    next = json.paging?.next ?? null;
  }

  return collected;
}
