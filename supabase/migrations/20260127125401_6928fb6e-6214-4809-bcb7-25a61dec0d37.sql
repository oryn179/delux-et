-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add verification_method column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_method text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Add coordinates to properties for map view
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude numeric;

-- Update profiles policies to allow admins to update any profile (for verification badge)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Update properties policies to allow admin management
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
ON public.properties
FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
ON public.properties
FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create login_history table for tracking logins
CREATE TABLE public.login_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    logged_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent text,
    ip_address text
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view login history"
ON public.login_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own login"
ON public.login_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);