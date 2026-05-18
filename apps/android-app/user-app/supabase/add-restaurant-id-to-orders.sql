-- Add restaurant_id column to the orders table
-- This allows us to link orders directly to specific restaurants and prevents conflict
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- If you have any existing orders without a restaurant_id, they will now be NULL.
-- In the future, this guarantees the admin panel can filter orders safely.
