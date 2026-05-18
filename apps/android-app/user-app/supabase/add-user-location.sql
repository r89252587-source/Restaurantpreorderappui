-- Add location columns to userProfile table
ALTER TABLE public."userProfile"
  ADD COLUMN IF NOT EXISTS latitude DECIMAL,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL,
  ADD COLUMN IF NOT EXISTS address TEXT;
