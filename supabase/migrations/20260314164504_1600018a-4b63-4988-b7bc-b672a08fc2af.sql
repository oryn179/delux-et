
CREATE TABLE public.owner_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

ALTER TABLE public.owner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own request" ON public.owner_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own request" ON public.owner_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON public.owner_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests" ON public.owner_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
