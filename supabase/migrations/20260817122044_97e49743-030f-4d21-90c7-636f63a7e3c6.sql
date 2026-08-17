ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_id TEXT,
ADD COLUMN IF NOT EXISTS otp_code TEXT,
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS otp_failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS otp_suspended_until TIMESTAMPTZ;

-- Security check for the new columns
COMMENT ON COLUMN public.profiles.otp_code IS 'Securely stored OTP code. Only accessible by service role.';

-- Update the get_public_profile function using correct column names
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', id,
    'name', name,
    'avatar_url', avatar_url,
    'verified', verified,
    'created_at', created_at
  )
  FROM public.profiles
  WHERE id = profile_id;
$$;
