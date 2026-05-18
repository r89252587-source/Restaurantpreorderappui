-- Add full_name and phone columns to userProfile table
ALTER TABLE public."userProfile"
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;
