-- StuMarket MVP foundation. Apply only to a new project owned by the project group.
-- Public listing images are intentionally public; never upload student IDs or private documents here.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Sinh viên NTTU' check (char_length(display_name) between 1 and 60),
  avatar_path text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '' check (char_length(description) <= 1200),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete restrict,
  shop_id uuid references public.shops (id) on delete restrict,
  title text not null check (char_length(title) between 3 and 90),
  category text not null check (category in ('Giáo trình', 'Máy tính', 'Vở và giấy', 'Dụng cụ học tập', 'Khác')),
  condition text not null check (condition in ('Mới', 'Đã qua sử dụng · còn tốt', 'Đã qua sử dụng · có ghi chú')),
  price_vnd integer not null check (price_vnd between 0 and 1000000000),
  campus text check (campus is null or campus in ('Quận 4', 'Quận 7', 'Quận 12', 'An Phú Đông')),
  description text not null default '' check (char_length(description) <= 1200),
  image_path text,
  status text not null default 'active' check (status in ('active', 'hidden', 'sold', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shop_listing_owner check (shop_id is null or seller_id is not null)
);

create index if not exists listings_public_search_idx on public.listings (status, category, created_at desc);
create index if not exists listings_seller_idx on public.listings (seller_id, created_at desc);
create index if not exists shops_public_idx on public.shops (status, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete restrict,
  target_type text not null check (target_type in ('listing', 'profile', 'shop')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists reports_queue_idx on public.reports (status, created_at desc);

-- Require an NTTU email on the server, regardless of the browser UI.
create or replace function public.require_nttu_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.email, '') !~* '@nttu[.]edu[.]vn$' then
    raise exception 'StuMarket accounts require an @nttu.edu.vn email address';
  end if;
  return new;
end;
$$;

drop trigger if exists stu_market_require_nttu_email on auth.users;
create trigger stu_market_require_nttu_email
before insert or update of email on auth.users
for each row execute function public.require_nttu_email();

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email_verified)
  values (new.id, new.email_confirmed_at is not null)
  on conflict (id) do update
    set email_verified = excluded.email_verified,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists stu_market_profile_after_auth on auth.users;
create trigger stu_market_profile_after_auth
after insert or update of email_confirmed_at on auth.users
for each row execute function public.sync_profile_from_auth();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
drop trigger if exists shops_touch_updated_at on public.shops;
create trigger shops_touch_updated_at before update on public.shops
for each row execute function public.touch_updated_at();
drop trigger if exists listings_touch_updated_at on public.listings;
create trigger listings_touch_updated_at before update on public.listings
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.listings enable row level security;
alter table public.reports enable row level security;

revoke all on public.profiles, public.shops, public.listings, public.reports from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, avatar_path) on public.profiles to authenticated;
grant select on public.shops to anon, authenticated;
grant insert (owner_id, name, description) on public.shops to authenticated;
grant update (name, description) on public.shops to authenticated;
grant update (status) on public.shops to authenticated;
grant select on public.listings to anon, authenticated;
grant insert (seller_id, shop_id, title, category, condition, price_vnd, campus, description, image_path, status) on public.listings to authenticated;
grant update (title, category, condition, price_vnd, campus, description, image_path, status) on public.listings to authenticated;
grant insert (reporter_id, target_type, target_id, reason) on public.reports to authenticated;
grant select, update (status, resolved_at) on public.reports to authenticated;

create policy "Public profiles show non-sensitive fields"
on public.profiles for select to anon, authenticated using (true);
create policy "Users update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Public can see approved shops"
on public.shops for select to anon, authenticated
using (status = 'approved' or owner_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Verified users apply for one shop"
on public.shops for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'pending'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.email_verified)
);
create policy "Owners edit pending shops; admins manage all shops"
on public.shops for update to authenticated
using (owner_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (
  (owner_id = (select auth.uid()) and status = 'pending')
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Public sees active listings and owners see their own"
on public.listings for select to anon, authenticated
using (
  status = 'active'
  or seller_id = (select auth.uid())
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "Verified users publish listings"
on public.listings for insert to authenticated
with check (
  seller_id = (select auth.uid())
  and status = 'active'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.email_verified)
  and (shop_id is null or exists (
    select 1 from public.shops s where s.id = shop_id and s.owner_id = (select auth.uid()) and s.status = 'approved'
  ))
);
create policy "Owners edit their own non-removed listings"
on public.listings for update to authenticated
using (seller_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (
  ((seller_id = (select auth.uid())) and status in ('active', 'hidden', 'sold'))
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Verified users submit reports"
on public.reports for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'open'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.email_verified)
);
create policy "Admins review reports"
on public.reports for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins resolve reports"
on public.reports for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Anyone can view public listing images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'listing-images');
create policy "Users upload listing images into their own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.email_verified)
);
create policy "Users update their own listing images"
on storage.objects for update to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete their own listing images"
on storage.objects for delete to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
