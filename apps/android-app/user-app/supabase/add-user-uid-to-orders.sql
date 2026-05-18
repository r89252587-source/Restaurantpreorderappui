-- Add user_uid column to the orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_uid UUID REFERENCES auth.users(id) ON DELETE SET NULL;
