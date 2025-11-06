-- Create ad_performance table for tracking ad views and clicks
CREATE TABLE IF NOT EXISTS public.ad_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('adsense', 'custom_html')),
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  user_identifier TEXT,
  ad_id TEXT,
  ad_slot TEXT
);

-- Enable RLS
ALTER TABLE public.ad_performance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert ad events"
ON public.ad_performance
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view ad performance"
ON public.ad_performance
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_ad_performance_page_path ON public.ad_performance(page_path);
CREATE INDEX idx_ad_performance_created_at ON public.ad_performance(created_at);
CREATE INDEX idx_ad_performance_ad_type ON public.ad_performance(ad_type);
CREATE INDEX idx_ad_performance_event_type ON public.ad_performance(event_type);