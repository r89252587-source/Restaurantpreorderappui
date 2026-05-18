-- Create enumeration for phone verification status
DO $$ BEGIN
    CREATE TYPE public.phone_verification_status AS ENUM ('verified', 'not verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add is_phoneVerified column to userProfile
ALTER TABLE public."userProfile" 
ADD COLUMN IF NOT EXISTS "is_phoneVerified" public.phone_verification_status DEFAULT 'not verified';
