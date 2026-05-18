-- Add customer_name and customer_phone columns to orders table
-- This guarantees we store the guest details for all orders, even if userProfile is missing.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
