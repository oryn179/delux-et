
-- Create Buy Service Deals table
CREATE TABLE IF NOT EXISTS public.buy_service_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price_info TEXT,
    telegram_bot_link TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.buy_service_deals ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.buy_service_deals TO anon, authenticated;
GRANT ALL ON public.buy_service_deals TO authenticated;
GRANT ALL ON public.buy_service_deals TO service_role;

-- Policies
CREATE POLICY "Anyone can view active deals" 
ON public.buy_service_deals FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage deals" 
ON public.buy_service_deals FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_buy_service_deals_updated_at ON public.buy_service_deals;
CREATE TRIGGER set_buy_service_deals_updated_at
    BEFORE UPDATE ON public.buy_service_deals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
