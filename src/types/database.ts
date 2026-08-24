export type BookStatus =
  | "candidate"
  | "currently_reading"
  | "previously_read"
  | "archived";

export type AnnouncementType =
  | "meetup"
  | "general"
  | "reminder"
  | "other";

export type PublishStatus = "draft" | "published" | "archived";

export type DrawStatus = "preview" | "confirmed" | "cancelled";

export type ImportStatus =
  | "pending"
  | "preview"
  | "completed"
  | "failed"
  | "partial";

export type AdminRole = "admin" | "owner";

export type GallerySource = "instagram" | "manual";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  role: AdminRole | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  page_count: number | null;
  description: string | null;
  description_ru: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  first_publish_year: number | null;
  edition_publish_year: number | null;
  language: string | null;
  subjects: string[];
  open_library_work_key: string | null;
  open_library_edition_key: string | null;
  google_books_id: string | null;
  cover_url: string | null;
  custom_cover_path: string | null;
  status: BookStatus;
  selected_month: number | null;
  selected_year: number | null;
  club_note: string | null;
  club_note_ru: string | null;
  normalized_title: string;
  normalized_authors: string;
  is_archived: boolean;
  date_added: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface MonthlyDraw {
  id: string;
  month: number;
  year: number;
  status: DrawStatus;
  selected_book_id: string | null;
  eligible_book_ids: string[];
  excluded_book_ids: string[];
  confirmed_at: string | null;
  admin_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title_en: string;
  title_ru: string | null;
  description_en: string | null;
  description_ru: string | null;
  announcement_type: AnnouncementType;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  maps_url: string | null;
  image_url: string | null;
  member_instructions: string | null;
  cancelled: boolean;
  publish_at: string | null;
  expires_at: string | null;
  is_pinned: boolean;
  status: PublishStatus;
  hide_when_expired: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface GalleryEvent {
  id: string;
  title_en: string;
  title_ru: string | null;
  event_date: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  event_id: string | null;
  storage_path: string;
  optimized_path: string | null;
  public_url: string;
  caption_en: string | null;
  caption_ru: string | null;
  alt_text: string | null;
  event_date: string | null;
  location: string | null;
  sort_order: number;
  is_featured: boolean;
  status: PublishStatus;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
  source: GallerySource;
  instagram_media_id: string | null;
  instagram_permalink: string | null;
  reviewed: boolean;
}

export interface SiteSettings {
  id: string;
  public_randomizer_enabled: boolean;
  instagram_url: string;
  logo_url: string | null;
  site_name: string;
  default_locale: string;
  instagram_auto_sync: boolean;
  instagram_auto_publish: boolean;
  updated_at: string;
}

export interface InstagramConnectionPublic {
  id: string;
  instagram_user_id: string;
  username: string | null;
  profile_picture_url: string | null;
  token_expires_at: string | null;
  requires_reconnect: boolean;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_message: string | null;
  connected: boolean;
}

export interface InstagramSyncLog {
  id: string;
  connection_id: string | null;
  triggered_by: string;
  status: string;
  fetched_count: number;
  added_count: number;
  skipped_count: number;
  failed_count: number;
  message: string | null;
  created_at: string;
}

export interface EditablePage {
  id: string;
  slug: string;
  title_en: string;
  title_ru: string | null;
  content_en: string;
  content_ru: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface ImportRecord {
  id: string;
  source_type: "google_sheets" | "csv_upload";
  source_url: string | null;
  filename: string | null;
  status: ImportStatus;
  column_mapping: Record<string, string>;
  total_rows: number;
  added_count: number;
  skipped_count: number;
  duplicate_count: number;
  failed_count: number;
  report: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type BookSearchResult = {
  title: string;
  subtitle?: string;
  authors: string[];
  firstPublishYear?: number;
  pageCount?: number;
  language?: string;
  isbn10?: string;
  isbn13?: string;
  subjects?: string[];
  coverUrl?: string;
  openLibraryWorkKey?: string;
  openLibraryEditionKey?: string;
  googleBooksId?: string;
  description?: string;
  provider: "open_library" | "google_books";
};
