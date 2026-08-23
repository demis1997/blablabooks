import type {
  ActivityLog,
  Announcement,
  Book,
  SiteSettings,
} from "@/types/database";
import { getLatestAnnouncement, listAnnouncements } from "./announcements";
import { listActivity } from "./activity";
import { getCurrentBook, listBooks } from "./books";
import { getLatestDraw } from "./draws";
import { listGalleryImages } from "./gallery";
import { getSiteSettings } from "./settings";

export type AdminOverview = {
  counts: {
    totalBooks: number;
    candidates: number;
    currentlyReading: number;
    previouslyRead: number;
    archived: number;
    gallery: number;
    announcements: number;
  };
  currentBook: Book | null;
  latestAnnouncement: Announcement | null;
  latestDraw: Awaited<ReturnType<typeof getLatestDraw>>;
  recentActivity: ActivityLog[];
  settings: SiteSettings;
};

export type OverviewStats = AdminOverview["counts"] & {
  activity: ActivityLog[];
};

/** Dashboard stats + recent activity for the admin overview page. */
export async function getOverviewStats(): Promise<OverviewStats> {
  const overview = await getAdminOverview();
  return {
    ...overview.counts,
    activity: overview.recentActivity,
  };
}

/**
 * Aggregated admin dashboard data (Supabase or demo).
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    allBooks,
    candidates,
    currentlyReading,
    previouslyRead,
    archived,
    gallery,
    announcements,
    currentBook,
    latestAnnouncement,
    latestDraw,
    recentActivity,
    settings,
  ] = await Promise.all([
    listBooks({ pageSize: 1, includeArchived: true }),
    listBooks({ status: "candidate", pageSize: 1, includeArchived: false }),
    listBooks({
      status: "currently_reading",
      pageSize: 1,
      includeArchived: false,
    }),
    listBooks({
      status: "previously_read",
      pageSize: 1,
      includeArchived: false,
    }),
    listBooks({ includeArchived: true, pageSize: 100 }),
    listGalleryImages({ includeUnpublished: true }),
    listAnnouncements({ includeHidden: true }),
    getCurrentBook(),
    getLatestAnnouncement(),
    getLatestDraw(),
    listActivity({ limit: 10 }),
    getSiteSettings(),
  ]);

  const archivedCount = archived.books.filter((b) => b.is_archived).length;

  return {
    counts: {
      totalBooks: allBooks.total,
      candidates: candidates.total,
      currentlyReading: currentlyReading.total,
      previouslyRead: previouslyRead.total,
      archived: archivedCount,
      gallery: gallery.length,
      announcements: announcements.length,
    },
    currentBook,
    latestAnnouncement,
    latestDraw,
    recentActivity,
    settings,
  };
}

export type PublicHomeData = {
  currentBook: Book | null;
  announcement: Announcement | null;
  candidates: Book[];
  featuredGallery: Awaited<ReturnType<typeof listGalleryImages>>;
  settings: SiteSettings;
};

export async function getPublicHomeData(): Promise<PublicHomeData> {
  const [currentBook, announcement, candidates, featuredGallery, settings] =
    await Promise.all([
      getCurrentBook(),
      getLatestAnnouncement(),
      listBooks({ status: "candidate", pageSize: 12, sort: "date_added" }),
      listGalleryImages({ featuredOnly: true }),
      getSiteSettings(),
    ]);

  return {
    currentBook,
    announcement,
    candidates: candidates.books,
    featuredGallery,
    settings,
  };
}
