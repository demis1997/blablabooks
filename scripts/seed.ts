/**
 * Seed Bla Bla Books with example books, announcement, and gallery metadata.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * About page content is already inserted by migration 001_initial_schema.sql.
 *
 * Usage: npm run seed
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  DEMO_ANNOUNCEMENTS,
  DEMO_BOOKS,
  DEMO_GALLERY,
} from "../src/lib/demo-data";

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

if (!url || !serviceKey) {
  console.log(`
Bla Bla Books seed skipped — Supabase service role is not configured.

1. Copy .env.example to .env.local and fill:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
2. Run the migration: supabase/migrations/001_initial_schema.sql
3. Re-run: npm run seed

Until then the app runs in demo mode with in-memory sample data.
`);
  process.exit(0);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function toBookRow(book: (typeof DEMO_BOOKS)[number]) {
  const {
    id,
    title,
    subtitle,
    authors,
    page_count,
    description,
    description_ru,
    isbn_10,
    isbn_13,
    first_publish_year,
    edition_publish_year,
    language,
    subjects,
    open_library_work_key,
    open_library_edition_key,
    google_books_id,
    cover_url,
    custom_cover_path,
    status,
    selected_month,
    selected_year,
    club_note,
    club_note_ru,
    normalized_title,
    normalized_authors,
    is_archived,
    date_added,
  } = book;

  return {
    id,
    title,
    subtitle,
    authors,
    page_count,
    description,
    description_ru,
    isbn_10,
    isbn_13,
    first_publish_year,
    edition_publish_year,
    language,
    subjects,
    open_library_work_key,
    open_library_edition_key,
    google_books_id,
    cover_url,
    custom_cover_path,
    status,
    selected_month,
    selected_year,
    club_note,
    club_note_ru,
    normalized_title,
    normalized_authors,
    is_archived,
    date_added,
  };
}

async function main() {
  console.log("Seeding Bla Bla Books…");

  const books = DEMO_BOOKS.map(toBookRow);
  const { error: booksError } = await supabase.from("books").upsert(books, {
    onConflict: "id",
  });
  if (booksError) {
    throw new Error(`books upsert failed: ${booksError.message}`);
  }
  console.log(`  books: ${books.length} rows`);

  const announcements = DEMO_ANNOUNCEMENTS.map(
    ({
      id,
      title_en,
      title_ru,
      description_en,
      description_ru,
      announcement_type,
      event_date,
      start_time,
      end_time,
      venue,
      address,
      maps_url,
      image_url,
      publish_at,
      expires_at,
      is_pinned,
      status,
      hide_when_expired,
    }) => ({
      id,
      title_en,
      title_ru,
      description_en,
      description_ru,
      announcement_type,
      event_date,
      start_time,
      end_time,
      venue,
      address,
      maps_url,
      image_url,
      publish_at,
      expires_at,
      is_pinned,
      status,
      hide_when_expired,
    }),
  );
  const { error: annError } = await supabase
    .from("announcements")
    .upsert(announcements, { onConflict: "id" });
  if (annError) {
    throw new Error(`announcements upsert failed: ${annError.message}`);
  }
  console.log(`  announcements: ${announcements.length} rows`);

  const gallery = DEMO_GALLERY.map((image) => {
    const publicUrl = image.public_url.startsWith("http")
      ? image.public_url
      : `${siteUrl.replace(/\/$/, "")}${image.public_url}`;
    return {
      id: image.id,
      event_id: image.event_id,
      storage_path: image.storage_path,
      optimized_path: image.optimized_path,
      public_url: publicUrl,
      caption_en: image.caption_en,
      caption_ru: image.caption_ru,
      alt_text: image.alt_text,
      event_date: image.event_date,
      location: image.location,
      sort_order: image.sort_order,
      is_featured: image.is_featured,
      status: image.status,
      width: image.width,
      height: image.height,
    };
  });
  const { error: galleryError } = await supabase
    .from("gallery_images")
    .upsert(gallery, { onConflict: "id" });
  if (galleryError) {
    throw new Error(`gallery_images upsert failed: ${galleryError.message}`);
  }
  console.log(`  gallery_images: ${gallery.length} rows`);

  console.log(`
Seed complete.

First admin:
  1. Create a user in Supabase Auth (Dashboard → Authentication → Users, or npm run create-admin -- you@example.com)
  2. Then run:
     UPDATE profiles SET is_admin = true WHERE email = 'you@example.com';

About page content is already present from migration 001_initial_schema.sql.
`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
