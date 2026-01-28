-- Create property_views table for tracking real-time view analytics
CREATE TABLE public.property_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_hash TEXT
);

-- Enable Row Level Security
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert views (for tracking)
CREATE POLICY "Anyone can record property views"
  ON public.property_views
  FOR INSERT
  WITH CHECK (true);

-- Only property owners can view their property analytics
CREATE POLICY "Property owners can view their property analytics"
  ON public.property_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_views.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Enable realtime for property_views
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_views;

-- Create an index for faster queries
CREATE INDEX idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON public.property_views(viewed_at);