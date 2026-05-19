-- Add OTP columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS otp            text,
  ADD COLUMN IF NOT EXISTS otp_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS otp_expires_at  timestamptz;

-- Policy to allow admins to update the order status and OTP verified timestamp
-- The existing "Admins can manage orders" policy might already cover this,
-- but we ensure they have explicit UPDATE permissions here if needed.
CREATE POLICY "admin complete order via otp"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
