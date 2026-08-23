import { z } from "zod";

export const bookStatusSchema = z.enum([
  "candidate",
  "currently_reading",
  "previously_read",
  "archived",
]);

export const announcementTypeSchema = z.enum([
  "meetup",
  "general",
  "reminder",
  "other",
]);

export const publishStatusSchema = z.enum(["draft", "published", "archived"]);

const optionalUrl = z
  .union([z.string().url(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v));

const optionalText = z
  .union([z.string(), z.literal(""), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null;
    const trimmed = v.trim();
    return trimmed.length ? trimmed : null;
  });

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  subtitle: optionalText,
  authors: z
    .array(z.string().trim().min(1))
    .min(1, "At least one author is required"),
  page_count: z.number().int().positive().nullable().optional(),
  description: optionalText,
  description_ru: optionalText,
  isbn_10: optionalText,
  isbn_13: optionalText,
  first_publish_year: z.number().int().min(1000).max(3000).nullable().optional(),
  edition_publish_year: z
    .number()
    .int()
    .min(1000)
    .max(3000)
    .nullable()
    .optional(),
  language: optionalText,
  subjects: z.array(z.string().trim().min(1)).optional().default([]),
  open_library_work_key: optionalText,
  open_library_edition_key: optionalText,
  google_books_id: optionalText,
  cover_url: optionalUrl,
  custom_cover_path: optionalText,
  status: bookStatusSchema.optional().default("candidate"),
  selected_month: z.number().int().min(1).max(12).nullable().optional(),
  selected_year: z.number().int().min(2000).max(2100).nullable().optional(),
  club_note: optionalText,
  club_note_ru: optionalText,
});

export const updateBookSchema = createBookSchema.partial().extend({
  id: z.string().uuid(),
  is_archived: z.boolean().optional(),
});

export const drawConfirmSchema = z.object({
  draw_id: z.string().uuid(),
  selected_book_id: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  notes: optionalText,
  excluded_book_ids: z.array(z.string().uuid()).optional().default([]),
  eligible_book_ids: z.array(z.string().uuid()).optional(),
});

export const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  title_en: z.string().trim().min(1, "English title is required").max(300),
  title_ru: optionalText,
  description_en: optionalText,
  description_ru: optionalText,
  announcement_type: announcementTypeSchema.default("meetup"),
  event_date: optionalText,
  start_time: optionalText,
  end_time: optionalText,
  venue: optionalText,
  address: optionalText,
  maps_url: optionalUrl,
  image_url: optionalUrl,
  publish_at: optionalText,
  expires_at: optionalText,
  is_pinned: z.boolean().optional().default(false),
  status: publishStatusSchema.optional().default("draft"),
  hide_when_expired: z.boolean().optional().default(true),
});

export const galleryImageMetadataSchema = z.object({
  id: z.string().uuid().optional(),
  event_id: z.string().uuid().nullable().optional(),
  caption_en: optionalText,
  caption_ru: optionalText,
  alt_text: optionalText,
  event_date: optionalText,
  location: optionalText,
  sort_order: z.number().int().min(0).optional().default(0),
  is_featured: z.boolean().optional().default(false),
  status: publishStatusSchema.optional().default("draft"),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type DrawConfirmInput = z.infer<typeof drawConfirmSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type GalleryImageMetadataInput = z.infer<
  typeof galleryImageMetadataSchema
>;
export type LoginInput = z.infer<typeof loginSchema>;
