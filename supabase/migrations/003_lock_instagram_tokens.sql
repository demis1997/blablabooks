-- Instagram access tokens must never be readable via the anon/authenticated client.

drop policy if exists "Admins can read instagram connection metadata" on public.instagram_connections;
drop policy if exists "Admins manage instagram connections" on public.instagram_connections;

create policy "No client access to instagram connection tokens"
  on public.instagram_connections for all
  using (false)
  with check (false);

drop policy if exists "Admins read instagram sync logs" on public.instagram_sync_logs;
drop policy if exists "Admins insert instagram sync logs" on public.instagram_sync_logs;

create policy "No client access to instagram sync logs"
  on public.instagram_sync_logs for all
  using (false)
  with check (false);

-- Hide cancelled meetups from the public announcement helper used by RLS, if present.
create or replace function public.announcement_is_public(a public.announcements)
returns boolean
language sql
stable
as $$
  select
    a.status = 'published'
    and coalesce(a.cancelled, false) = false
    and (a.publish_at is null or a.publish_at <= now())
    and (
      a.expires_at is null
      or a.expires_at > now()
      or a.hide_when_expired = false
    );
$$;
