create extension if not exists pgcrypto;

create type public.item_status as enum ('Available', 'Reserved', 'Sold');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  brand text,
  model text,
  description text,
  condition text,
  original_purchase_price numeric(10, 2),
  current_retail_price numeric(10, 2),
  selling_price numeric(10, 2) not null check (selling_price >= 0),
  currency text not null default 'DKK',
  retailer_name text,
  reference_url text,
  retail_price_checked_at date,
  status public.item_status not null default 'Available',
  featured boolean not null default false,
  visible boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  storage_path text,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 100,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  id integer primary key default 1 check (id = 1),
  hide_sold_homepage boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, hide_sold_homepage)
values (1, false)
on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_items_updated_at
before update on public.items
for each row execute function public.touch_updated_at();

create or replace function public.touch_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_app_settings_updated_at
before update on public.app_settings
for each row execute function public.touch_settings_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select profiles.is_admin from public.profiles where profiles.id = auth.uid()),
    false
  );
$$;

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles can read self"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "public can read visible items"
on public.items for select
to anon, authenticated
using (visible = true);

create policy "admins can manage items"
on public.items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read images for visible items"
on public.item_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.items
    where items.id = item_images.item_id
      and items.visible = true
  )
);

create policy "admins can manage images"
on public.item_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read settings"
on public.app_settings for select
to anon, authenticated
using (true);

create policy "admins can update settings"
on public.app_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "public can read item images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'item-images');

create policy "admins can upload item images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'item-images' and public.is_admin());

create policy "admins can update item images"
on storage.objects for update
to authenticated
using (bucket_id = 'item-images' and public.is_admin())
with check (bucket_id = 'item-images' and public.is_admin());

create policy "admins can delete item images"
on storage.objects for delete
to authenticated
using (bucket_id = 'item-images' and public.is_admin());

create index items_visible_status_idx on public.items (visible, status, sort_order);
create index items_slug_idx on public.items (slug);
create index item_images_item_sort_idx on public.item_images (item_id, sort_order);
