ALTER TABLE public.profiles ALTER COLUMN otp_failed_attempts SET DEFAULT 0;

-- Ensure RLS allows the edge function (service role) to update these fields
-- The edge function uses the service role key, so RLS is bypassed, 
-- but it's good practice to have clear policies.

GRANT UPDATE (verified, telegram_id, otp_code, otp_expires_at, otp_failed_attempts, otp_suspended_until) 
ON public.profiles TO service_role;
