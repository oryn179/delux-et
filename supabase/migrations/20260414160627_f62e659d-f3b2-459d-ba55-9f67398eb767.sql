-- Remove unused tables from Realtime publication to prevent unauthorized subscriptions
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.property_views;

-- Fix profiles SELECT policy: replace broad access with scoped access
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

-- Users can read their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Other authenticated users can only see limited profile info via a security definer function
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE(user_id uuid, name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;