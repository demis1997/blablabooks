# Bla Bla Books

Community book club site for **Bla Bla Books** (Cyprus) — bilingual EN/RU public pages, monthly book draws, meetup announcements, gallery, and an admin console for managing the catalog.

Without Supabase credentials the app runs in **demo mode** with in-memory sample data so you can explore the UI immediately.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo mode works with empty Supabase env vars.

Admin demo login: open `/en/admin/login` and use the demo sign-in (sets a cookie when Supabase is not configured).

Optional: set `GOOGLE_BOOKS_API_KEY` for richer search / page-count enrichment.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL**, **anon key**, and **service role key** into `.env.local` (see `.env.example`).
3. In the SQL editor, run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql). This creates tables, RLS, storage buckets (`gallery`, `covers`), site settings, and the About page.
4. Confirm buckets **gallery** and **covers** exist under Storage (created by the migration).
5. Seed example books / announcement / gallery metadata:

```bash
npm run seed
```

6. In `next.config.ts`, images already allow `**.supabase.co` storage URLs. If optimization fails for your project, set an exact hostname such as `abcdefgh.supabase.co`.

## Creating the first admin

1. Invite a user (Dashboard → Authentication → Invite, or):

```bash
npm run create-admin -- you@example.com "Your Name"
```

2. Or after the user exists, run SQL:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'you@example.com';
```

## Importing the Google Sheet

1. Sign in to Admin → **Import**.
2. The club Google Sheets CSV URL is prefilled (`GOOGLE_SHEETS_CSV_URL` in code).
3. Preview → map columns (Title / Author / Pages / Status / Notes) → commit.
4. You can also upload a CSV file instead of fetching the sheet.

Sheet must be shared as “Anyone with the link can view” (or export CSV yourself and upload).

## Vercel deployment

1. Push the repo and import the project in Vercel.
2. Set the same env vars as `.env.example` (use your production `NEXT_PUBLIC_SITE_URL`).
3. Deploy. Framework preset: Next.js.
4. Point your domain at Vercel and update Supabase Auth redirect URLs to include `https://your-domain/.../admin/login`.

## Admin user guide

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for day-to-day tasks (books, randomizer, announcements, gallery, pages, settings).

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **next-intl** (EN/RU)
- **Supabase** (Auth, Postgres, Storage) with demo fallback
- **Tailwind CSS** + Radix UI primitives
- **Zod** / React Hook Form
- **Vitest** for unit tests
- Open Library (+ optional Google Books) for catalog search

## Scripts

| Script | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test` / `npm run test:watch` |
| Production build | `npm run build` |
| Seed DB | `npm run seed` |
| Create admin | `npm run create-admin -- email@example.com` |

Dev dependency `tsx` is used for seed / create-admin scripts.

## What you still need to configure

- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (seed / create-admin only)
- [ ] Run migration `001_initial_schema.sql`
- [ ] First admin (`is_admin = true`)
- [ ] Optional: `GOOGLE_BOOKS_API_KEY`
- [ ] Optional: Vercel project + Auth redirect URLs
- [ ] Optional: exact Supabase image hostname in `next.config.ts` if needed

Feature checklist: [FEATURES.md](FEATURES.md).
