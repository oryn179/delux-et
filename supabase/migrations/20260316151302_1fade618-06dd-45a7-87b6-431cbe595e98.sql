-- Add listing approval columns to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_reviewed_at timestamptz;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_reviewed_by uuid;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_admin_note text;

-- Create support_messages table if not exists
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_admin_reply boolean NOT NULL DEFAULT false,
  admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS for support_messages (use IF NOT EXISTS pattern via DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Users can view own support messages') THEN
    CREATE POLICY "Users can view own support messages" ON public.support_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Users can insert own support messages') THEN
    CREATE POLICY "Users can insert own support messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_admin_reply = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Admins can view all support messages') THEN
    CREATE POLICY "Admins can view all support messages" ON public.support_messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Admins can insert replies') THEN
    CREATE POLICY "Admins can insert replies" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') AND is_admin_reply = true);
  END IF;
END $$;

-- Enable realtime for support_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
