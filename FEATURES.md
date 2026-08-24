# Features — Bla Bla Books

## Completed

- Bilingual public site (EN/RU) with next-intl routing
- Home: brand hero, current book, meetup announcement, how it works, gallery preview, Instagram CTA
- Books browser with status filters and detail dialog
- Public randomizer (when enabled in settings)
- Gallery grid + lightbox
- About page (editable markdown)
- SEO helpers: sitemap, robots
- Admin dashboard (demo cookie or Supabase admin)
  - Books CRUD + Open Library / Google enrichment + CSV export
  - Duplicate detection (ISBN, OL work key, title+author)
  - Metadata refresh from providers
  - Monthly draw preview + confirm with status transitions
  - Announcements CRUD with publish/expiry visibility rules
  - Gallery upload/metadata management
  - Google Sheet / CSV import with column mapping
  - Editable pages + site settings
  - Activity-oriented admin overview
- Demo mode with in-memory seed data when Supabase env is empty
- Postgres schema, RLS, and storage buckets (`gallery`, `covers`)
- Unit tests (normalize, duplicates, random, announcements, CSV, export, search guard, draw confirm, auth guard)
- Seed + create-admin scripts, `.env.example`, README / admin docs

## Remaining credentials / ops

Configure these before production:

| Item | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute links, Auth redirects, seed gallery URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server anon client |
| `SUPABASE_SERVICE_ROLE_KEY` | `npm run seed` / `create-admin` only |
| Migration `001_initial_schema.sql` | Schema, RLS, buckets, About seed |
| First admin (`profiles.is_admin`) | Admin dashboard access |
| `GOOGLE_BOOKS_API_KEY` (optional) | Better page counts / search fallback |
| `INSTAGRAM_ACCESS_TOKEN` (optional) | Live gallery from @bla.bla.books.cy via Graph API |
| Vercel env + Auth redirect URLs | Production hosting |
| Exact Supabase image host (if needed) | `next/image` remotePatterns |

Until Supabase is configured, the app remains fully browsable in demo mode.
