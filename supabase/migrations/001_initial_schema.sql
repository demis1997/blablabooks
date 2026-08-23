-- Bla Bla Books — initial schema, RLS, and storage policies
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- Enums
create type public.book_status as enum (
  'candidate',
  'currently_reading',
  'previously_read',
  'archived'
);

create type public.announcement_type as enum (
  'meetup',
  'general',
  'reminder',
  'other'
);

create type public.publish_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.draw_status as enum (
  'preview',
  'confirmed',
  'cancelled'
);

create type public.import_status as enum (
  'pending',
  'preview',
  'completed',
  'failed',
  'partial'
);

-- Profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  authors text[] not null default '{}',
  page_count integer check (page_count is null or page_count > 0),
  description text,
  description_ru text,
  isbn_10 text,
  isbn_13 text,
  first_publish_year integer,
  edition_publish_year integer,
  language text,
  subjects text[] not null default '{}',
  open_library_work_key text,
  open_library_edition_key text,
  google_books_id text,
  cover_url text,
  custom_cover_path text,
  status public.book_status not null default 'candidate',
  selected_month integer check (selected_month is null or (selected_month between 1 and 12)),
  selected_year integer,
  club_note text,
  club_note_ru text,
  normalized_title text not null,
  normalized_authors text not null default '',
  is_archived boolean not null default false,
  date_added date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index books_status_idx on public.books (status) where is_archived = false;
create index books_normalized_title_idx on public.books (normalized_title);
create index books_isbn_13_idx on public.books (isbn_13) where isbn_13 is not null;
create index books_ol_work_idx on public.books (open_library_work_key) where open_library_work_key is not null;

create table public.monthly_draws (
  id uuid primary key default gen_random_uuid(),
  month integer not null check (month between 1 and 12),
  year integer not null,
  status public.draw_status not null default 'preview',
  selected_book_id uuid references public.books (id) on delete set null,
  eligible_book_ids uuid[] not null default '{}',
  excluded_book_ids uuid[] not null default '{}',
  confirmed_at timestamptz,
  admin_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index monthly_draws_confirmed_idx on public.monthly_draws (year desc, month desc)
  where status = 'confirmed';

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ru text,
  description_en text,
  description_ru text,
  announcement_type public.announcement_type not null default 'meetup',
  event_date date,
  start_time time,
  end_time time,
  venue text,
  address text,
  maps_url text,
  image_url text,
  publish_at timestamptz,
  expires_at timestamptz,
  is_pinned boolean not null default false,
  status public.publish_status not null default 'draft',
  hide_when_expired boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.gallery_events (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ru text,
  event_date date,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.gallery_events (id) on delete set null,
  storage_path text not null,
  optimized_path text,
  public_url text not null,
  caption_en text,
  caption_ru text,
  alt_text text,
  event_date date,
  location text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  status public.publish_status not null default 'draft',
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  uploaded_by uuid references public.profiles (id) on delete set null
);

create index gallery_images_status_idx on public.gallery_images (status, sort_order);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  public_randomizer_enabled boolean not null default true,
  instagram_url text not null default 'https://www.instagram.com/bla.bla.books.cy/',
  logo_url text,
  site_name text not null default 'Bla Bla Books',
  default_locale text not null default 'en',
  updated_at timestamptz not null default now()
);

create table public.editable_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_ru text,
  content_en text not null,
  content_ru text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table public.imports (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('google_sheets', 'csv_upload')),
  source_url text,
  filename text,
  status public.import_status not null default 'pending',
  column_mapping jsonb not null default '{}',
  total_rows integer not null default 0,
  added_count integer not null default 0,
  skipped_count integer not null default 0,
  duplicate_count integer not null default 0,
  failed_count integer not null default 0,
  report jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_created_idx on public.activity_log (created_at desc);

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger books_updated_at before update on public.books
  for each row execute function public.set_updated_at();
create trigger monthly_draws_updated_at before update on public.monthly_draws
  for each row execute function public.set_updated_at();
create trigger announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();
create trigger gallery_events_updated_at before update on public.gallery_events
  for each row execute function public.set_updated_at();
create trigger gallery_images_updated_at before update on public.gallery_images
  for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger editable_pages_updated_at before update on public.editable_pages
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup (admins must still be flagged manually)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check helper
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- Announcement visibility helper
create or replace function public.announcement_is_public(a public.announcements)
returns boolean
language sql
stable
as $$
  select
    a.status = 'published'
    and (a.publish_at is null or a.publish_at <= now())
    and (
      a.expires_at is null
      or a.expires_at > now()
      or a.hide_when_expired = false
    );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.monthly_draws enable row level security;
alter table public.announcements enable row level security;
alter table public.gallery_events enable row level security;
alter table public.gallery_images enable row level security;
alter table public.site_settings enable row level security;
alter table public.editable_pages enable row level security;
alter table public.imports enable row level security;
alter table public.activity_log enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin());

-- Books: public read non-archived; admin write
create policy "Public can read active books"
  on public.books for select
  using (is_archived = false or public.is_admin());

create policy "Admins manage books"
  on public.books for all
  using (public.is_admin())
  with check (public.is_admin());

-- Draws: public can read confirmed; admin all
create policy "Public can read confirmed draws"
  on public.monthly_draws for select
  using (status = 'confirmed' or public.is_admin());

create policy "Admins manage draws"
  on public.monthly_draws for all
  using (public.is_admin())
  with check (public.is_admin());

-- Announcements
create policy "Public can read published announcements"
  on public.announcements for select
  using (public.announcement_is_public(announcements) or public.is_admin());

create policy "Admins manage announcements"
  on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin());

-- Gallery events
create policy "Public can read gallery events"
  on public.gallery_events for select
  using (true);

create policy "Admins manage gallery events"
  on public.gallery_events for all
  using (public.is_admin())
  with check (public.is_admin());

-- Gallery images
create policy "Public can read published gallery images"
  on public.gallery_images for select
  using (status = 'published' or public.is_admin());

create policy "Admins manage gallery images"
  on public.gallery_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Site settings
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Editable pages
create policy "Public can read editable pages"
  on public.editable_pages for select
  using (true);

create policy "Admins manage editable pages"
  on public.editable_pages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Imports & activity: admin only
create policy "Admins manage imports"
  on public.imports for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read activity"
  on public.activity_log for select
  using (public.is_admin());

create policy "Admins insert activity"
  on public.activity_log for insert
  with check (public.is_admin());

-- Storage buckets
insert into storage.buckets (id, name, public)
values
  ('gallery', 'gallery', true),
  ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "Public read gallery images"
  on storage.objects for select
  using (bucket_id in ('gallery', 'covers'));

create policy "Admins upload gallery and covers"
  on storage.objects for insert
  with check (
    bucket_id in ('gallery', 'covers')
    and public.is_admin()
  );

create policy "Admins update gallery and covers"
  on storage.objects for update
  using (
    bucket_id in ('gallery', 'covers')
    and public.is_admin()
  );

create policy "Admins delete gallery and covers"
  on storage.objects for delete
  using (
    bucket_id in ('gallery', 'covers')
    and public.is_admin()
  );

-- Seed settings row
insert into public.site_settings (public_randomizer_enabled, instagram_url)
values (true, 'https://www.instagram.com/bla.bla.books.cy/');

insert into public.editable_pages (slug, title_en, title_ru, content_en, content_ru)
values
(
  'about',
  'About Bla Bla Books',
  'О Bla Bla Books',
  $en$
## What is Bla Bla Books?

Bla Bla Books is a community book club in Cyprus for people who love reading and talking about books — in English, Russian, or both.

## Our community

We welcome English-speaking and Russian-speaking readers. Meetings are friendly and informal: bring the month’s book (or your curiosity) and join the conversation.

## How meetings work

Books are suggested by members, one title is selected for the month, and we meet to discuss it. Details for each meetup are shared on this site and on Instagram.

## Who can join

Anyone in Cyprus who enjoys books is welcome. Follow us on Instagram to stay in the loop and say hello.

## Locations

We meet in venues across Cyprus. Check the latest meetup announcement for the current place and time.
$en$,
  $ru$
## Что такое Bla Bla Books?

Bla Bla Books — это книжный клуб на Кипре для тех, кто любит читать и обсуждать книги — на английском, русском или на обоих языках.

## Наше сообщество

Мы рады англоязычным и русскоязычным читателям. Встречи тёплые и неформальные: приходите с книгой месяца (или просто с интересом) и присоединяйтесь к разговору.

## Как проходят встречи

Участники предлагают книги, одна выбирается на месяц, и мы встречаемся, чтобы её обсудить. Подробности каждой встречи публикуются на сайте и в Instagram.

## Кто может присоединиться

Любой на Кипре, кому нравятся книги. Подписывайтесь на Instagram, чтобы быть в курсе и поздороваться.

## Локации

Мы встречаемся в разных местах на Кипре. Актуальный адрес и время — в анонсе ближайшей встречи.
$ru$
);
