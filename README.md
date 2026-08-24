# Bla Bla Books

Community book club site for **Bla Bla Books** (Cyprus) — bilingual EN/RU public pages, monthly book draws, meetup announcements, gallery, and an owner admin dashboard.

Without Supabase credentials the app runs in **demo mode** with in-memory sample data so you can explore the UI immediately.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo mode works with empty Supabase env vars.

Admin demo: `/en/admin/login` → demo sign-in (cookie only when Supabase is not configured). There is **no public signup**.

Optional: set `GOOGLE_BOOKS_API_KEY` for richer search / page-count enrichment.

## 1. Supabase authentication

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon key** into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Copy the **service role** key into `SUPABASE_SERVICE_ROLE_KEY` (server-only; never `NEXT_PUBLIC_`).
4. In the SQL editor, run in order:
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_owner_instagram.sql`](supabase/migrations/002_owner_instagram.sql)
   - [`supabase/migrations/003_lock_instagram_tokens.sql`](supabase/migrations/003_lock_instagram_tokens.sql)
5. Confirm Storage buckets **gallery** and **covers**.
6. Authentication → URL configuration:
   - Site URL: your `NEXT_PUBLIC_SITE_URL`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://YOUR-DOMAIN/auth/callback`
     - `http://localhost:3000/en/admin/reset-password`
     - `https://YOUR-DOMAIN/en/admin/reset-password` (and `/ru/...` if you use it)
7. Disable public signup in Authentication → Providers → Email (uncheck “Enable sign ups” if available). Admins are created only via invite / `npm run create-admin`.
8. Seed optional demo rows: `npm run seed`

## 2. Invite Daria as the first owner

Do **not** invent her email. Ask her privately.

```bash
npm run create-admin
```

The script asks for email and display name (default **Daria**), requires `SUPABASE_SERVICE_ROLE_KEY`, sends a Supabase invitation, and assigns `profiles.role = owner` plus `is_admin = true`. It **never prints or stores a password**.

Alternatively, in the Supabase dashboard: Authentication → Invite user, then:

```sql
update public.profiles
set is_admin = true, role = 'owner', display_name = 'Daria'
where email = 'her-real-email@example.com';
```

## 3. How she sets her private password

Daria opens the invite email, lands on `/auth/callback`, then `/en/admin/reset-password` (or the Russian locale equivalent), and chooses her own password. Use **Forgot password** at `/en/admin/forgot-password` later. Reset emails use a generic confirmation so they do not reveal whether an account exists.

Never reuse a password that was shared in chat.

## 4–7. Meta developer app (Instagram Login)

Do **not** scrape Instagram. The developer does not need the `@bla.bla.books.cy` password. Daria authorizes the club account herself.

1. Convert `@bla.bla.books.cy` to a Professional (Creator or Business) account if it is not already.
2. Create a Meta app → add **Instagram** → **Instagram API with Instagram Login** (not the discontinued Basic Display API).
3. Valid OAuth redirect URL (exact match):

   `https://YOUR-DOMAIN/api/instagram/callback`

   Local: `http://localhost:3000/api/instagram/callback`

4. Required permission: `instagram_business_basic` (profile + media).
5. Add Daria as an Instagram tester / app role during development until the app is live.
6. Set server env: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI` (same callback URL). Never prefix these with `NEXT_PUBLIC_`.

Connection flow: Admin → Instagram → **Connect @bla.bla.books.cy** → Meta/Instagram login → approve media → callback stores a long-lived token **only on the server**. New media lands in an unpublished review queue unless she enables automatic publishing.

## 8. Vercel environment variables

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only |
| `INSTAGRAM_APP_ID` | Meta app id |
| `INSTAGRAM_APP_SECRET` | Server-only |
| `INSTAGRAM_REDIRECT_URI` | `https://YOUR-DOMAIN/api/instagram/callback` |
| `CRON_SECRET` | Random secret for cron |
| `GOOGLE_BOOKS_API_KEY` | Optional |

Do not put secrets in Git or filled-in values in `.env.example`.

## 9. Cron synchronization

`vercel.json` schedules `GET /api/cron/instagram` every 6 hours. Vercel sends `Authorization: Bearer $CRON_SECRET`. The job is idempotent (unique Instagram media ids), does not unpublish photos on a temporary API failure, and stops retrying usefully when reconnection is required.

Turn automatic sync off on the Instagram admin page if needed.

## 10. Instagram reconnection

If the dashboard says **Instagram needs to be reconnected**, Daria clicks **Reconnect Instagram** and completes Meta’s screen again. Token refresh is attempted during sync; failure marks the integration as needing reconnect without wiping the gallery.

## 11. Revoke an admin

```sql
update public.profiles
set is_admin = false, role = null
where email = 'person@example.com';
```

Then Authentication → Users → ban or delete that user.

## 12. Recover owner access

If Daria loses access: another person with `SUPABASE_SERVICE_ROLE_KEY` runs `npm run create-admin` for her email (assigns owner again) or invites her from the dashboard and sets `role = 'owner'`. She sets a new password via the email link. Keep at least one owner.

## Instagram gallery behaviour

Imported posts are **not** published automatically. Daria reviews them, then publish / hide / feature. Manual uploads still work on Admin → Gallery (labelled **Manual upload** vs **Instagram**).

## Importing the Google Sheet

Admin → **Import**. Prefill or upload CSV. Preview → map columns → commit.

## Scripts

| Script | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test` |
| Production build | `npm run build` |
| Seed DB | `npm run seed` |
| Invite owner | `npm run create-admin` |

## Admin user guide

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md).
