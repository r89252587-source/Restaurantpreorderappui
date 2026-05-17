-- Add latitude and longitude columns to restaurants table
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS latitude DECIMAL,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL;
