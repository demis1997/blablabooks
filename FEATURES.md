# Features — Bla Bla Books

## Completed

- Bilingual public site (EN/RU) with next-intl routing
- Home: current book, next published future meetup, announcement banner, gallery preview, Instagram CTA
- Books browser, public randomizer, gallery, About
- Owner admin dashboard (Supabase Auth, no public signup)
  - Invite-only owner via `npm run create-admin` (Daria chooses her password)
  - Books, randomizer (server-side), current book, meetups, announcements, gallery, Instagram OAuth, pages, settings, import
- Instagram API with Instagram Login (OAuth, review queue, cron, no scraping)
- Manual gallery uploads alongside Instagram
- Demo mode when Supabase env is empty
- RLS, token tables not readable by the anon client, Vitest coverage for auth/sync helpers

See README for env, Meta app, cron, and owner recovery.
