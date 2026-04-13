
-- 1. Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- 2. Restrict system_settings SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Admins can read system settings"
  ON public.system_settings FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict notifications INSERT to authenticated users
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Restrict referrals INSERT to authenticated users
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
CREATE POLICY "Authenticated users can insert referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (true);

-- 5. Restrict referral_codes SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view referral codes for lookup" ON public.referral_codes;
CREATE POLICY "Authenticated users can lookup referral codes"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (true);

-- 6. Restrict donations INSERT to authenticated users
DROP POLICY IF EXISTS "Anyone can insert donations" ON public.donations;
CREATE POLICY "Authenticated users can insert donations"
  ON public.donations FOR INSERT TO authenticated
  WITH CHECK (true);
