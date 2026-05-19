-- Add owner_id on restaurants and restaurant_id on adminProfile
-- Run this in Supabase SQL Editor.

alter table public.restaurants
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table public."adminProfile"
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete set null;

create index if not exists idx_restaurants_owner_id on public.restaurants(owner_id);
create index if not exists idx_adminprofile_restaurant_id on public."adminProfile"(restaurant_id);
