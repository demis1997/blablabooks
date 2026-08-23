# Admin guide — Bla Bla Books

Short reference for club admins. Public site is EN/RU; admin UI follows the same locales.

## Sign in

- **Production / Supabase:** `/en/admin/login` with your invited email (magic link / password per Auth settings).
- **Local demo (no Supabase):** use the demo admin button on the login page.

Only profiles with `is_admin = true` can access the dashboard.

## Books

- **List / search:** Admin → Books. Filter by status (candidate, currently reading, previously read, archived).
- **Add:** New book → search Open Library (optional Google fallback) or enter details manually. Duplicate checks use ISBN, Open Library work key, and title+author.
- **Edit:** Update metadata, covers, club notes (EN/RU), archive if needed.
- **Current book:** Also visible under Current book; usually set by confirming a draw.

## Monthly randomizer

1. Admin → Randomizer.
2. Optionally exclude candidates you do not want in the pool.
3. Draw a preview (cryptographically random among eligible candidates).
4. Confirm to set the winner as **currently reading** and move the previous current book to **previously read**.
5. History of draws is listed on the same page.

Public randomizer page can be toggled in Settings.

## Announcements / meetups

- Create meetup or general announcements with EN/RU titles and descriptions.
- Set publish / expiry times and `hide when expired`.
- Pin important meetups so they surface on the home page.

## Gallery

- Upload images to the `gallery` bucket (or demo placeholders locally).
- Edit captions (EN/RU), feature flags, publish status.
- Featured images appear on the home preview; all published images on Gallery.

## Pages & settings

- **Pages:** Edit the About page markdown (EN/RU).
- **Settings:** Site name, Instagram URL, public randomizer on/off, default locale.

## Import (Google Sheet / CSV)

1. Admin → Import.
2. Keep the prefilled Sheets CSV URL or paste another export URL / upload a CSV.
3. Preview rows, adjust column mapping, skip duplicates or override.
4. Commit. Review the import report and history.

## Tips

- Prefer confirming draws rather than manually flipping statuses so history stays consistent.
- Keep club notes short; they show on the current-book card.
- After changing Auth users, remember `UPDATE profiles SET is_admin = true WHERE email = '…';` for new admins.
