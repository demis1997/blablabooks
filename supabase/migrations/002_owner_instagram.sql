-- Owner roles, Instagram OAuth storage, gallery source tracking, meetup extras

do $$ begin
  create type public.admin_role as enum ('admin', 'owner');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.gallery_source as enum ('instagram', 'manual');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists role public.admin_role;

update public.profiles
set role = 'admin'
where is_admin = true and role is null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (
        is_admin = true
        or role in ('admin', 'owner')
      )
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'owner'
  );
$$;

alter table public.announcements
  add column if not exists city text,
  add column if not exists member_instructions text,
  add column if not exists cancelled boolean not null default false;

alter table public.gallery_images
  add column if not exists source public.gallery_source not null default 'manual',
  add column if not exists instagram_media_id text,
  add column if not exists instagram_permalink text,
  add column if not exists reviewed boolean not null default true;

create unique index if not exists gallery_images_instagram_media_id_idx
  on public.gallery_images (instagram_media_id)
  where instagram_media_id is not null;

alter table public.site_settings
  add column if not exists instagram_auto_sync boolean not null default true,
  add column if not exists instagram_auto_publish boolean not null default false;

create table if not exists public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  instagram_user_id text not null unique,
  username text,
  profile_picture_url text,
  access_token text not null,
  token_expires_at timestamptz,
  requires_reconnect boolean not null default false,
  connected_by uuid references public.profiles (id) on delete set null,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger instagram_connections_updated_at before update on public.instagram_connections
  for each row execute function public.set_updated_at();

create table if not exists public.instagram_sync_logs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references public.instagram_connections (id) on delete set null,
  triggered_by text not null default 'manual',
  status text not null,
  fetched_count integer not null default 0,
  added_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_ip_created_idx
  on public.login_attempts (ip_hash, created_at desc);

alter table public.instagram_connections enable row level security;
alter table public.instagram_sync_logs enable row level security;
alter table public.login_attempts enable row level security;

create policy "Admins can read instagram connection metadata"
  on public.instagram_connections for select
  using (public.is_admin());

create policy "Admins manage instagram connections"
  on public.instagram_connections for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read instagram sync logs"
  on public.instagram_sync_logs for select
  using (public.is_admin());

create policy "Admins insert instagram sync logs"
  on public.instagram_sync_logs for insert
  with check (public.is_admin());

-- Login attempts are written by service role / server only
create policy "No client access to login attempts"
  on public.login_attempts for all
  using (false)
  with check (false);
