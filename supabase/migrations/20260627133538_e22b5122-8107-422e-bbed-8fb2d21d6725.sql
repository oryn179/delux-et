
-- 1. Notifications: tighten INSERT policy (replaces WITH CHECK true)
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Harden notification trigger functions with sender validation
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only fire when the authenticated caller is the actual sender
  IF auth.uid() IS NULL OR NEW.sender_id <> auth.uid() THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.recipient_id,
    'message',
    'New message received',
    'You have a new inquiry about your property',
    '/inbox'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_on_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Reviews must be authored by the authenticated caller
  IF auth.uid() IS NULL OR NEW.reviewer_id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.owner_id,
    'review',
    'New review received',
    'Someone left a review on your profile',
    '/profile'
  );
  RETURN NEW;
END;
$function$;

-- 3. Prevent self-escalation of sensitive profile flags
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Service role / SECURITY DEFINER contexts with no auth.uid() pass through
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins may change everything
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Block changes to sensitive flags for regular users
  IF NEW.verified IS DISTINCT FROM OLD.verified
     OR NEW.email_verified IS DISTINCT FROM OLD.email_verified
     OR NEW.phone_verified IS DISTINCT FROM OLD.phone_verified
     OR NEW.verification_method IS DISTINCT FROM OLD.verification_method
     OR NEW.banned IS DISTINCT FROM OLD.banned
     OR NEW.banned_at IS DISTINCT FROM OLD.banned_at
     OR NEW.banned_reason IS DISTINCT FROM OLD.banned_reason
  THEN
    RAISE EXCEPTION 'Not allowed to modify sensitive profile fields';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 4. Fix mutable search_path on generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  new_code text;
  letters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  code_exists boolean;
BEGIN
  LOOP
    new_code := substr(letters, floor(random() * 26 + 1)::int, 1)
             || substr(letters, floor(random() * 26 + 1)::int, 1)
             || floor(random() * 10)::text
             || floor(random() * 10)::text;
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- 5. Storage: enforce folder ownership on uploads to property-images
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Users can upload to their own property-images folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Remove broad listing policy on the public property-images bucket.
-- Direct public URLs continue to work because the bucket is public; this only
-- prevents enumerating/listing all objects via the Storage API.
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
