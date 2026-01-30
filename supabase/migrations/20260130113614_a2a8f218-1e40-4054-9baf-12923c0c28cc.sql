-- Create admin_activity_logs table for tracking admin actions
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
ON public.admin_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert logs
CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create donations table for tracking support/donations
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT,
  donor_email TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'ETB',
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Only admins can view donations
CREATE POLICY "Admins can view donations"
ON public.donations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Anyone can insert donations (for webhook/external tracking)
CREATE POLICY "Anyone can insert donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

-- Create system_settings table for feature toggles
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read system settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add banned column to profiles for ban/unban functionality
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('signup_enabled', 'true', 'Allow new user registrations'),
  ('listing_enabled', 'true', 'Allow creating new property listings'),
  ('verification_required', 'true', 'Require phone verification to post listings'),
  ('maintenance_mode', 'false', 'Enable maintenance mode')
ON CONFLICT (key) DO NOTHING;