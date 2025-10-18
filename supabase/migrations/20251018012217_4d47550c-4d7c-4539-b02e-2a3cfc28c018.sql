-- Create table for countdown timer settings
CREATE TABLE IF NOT EXISTS public.countdown_timer (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Countdown',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.countdown_timer ENABLE ROW LEVEL SECURITY;

-- Anyone can view countdown settings
CREATE POLICY "Anyone can view countdown" 
ON public.countdown_timer 
FOR SELECT 
USING (true);

-- Admins can modify countdown settings
CREATE POLICY "Admins can modify countdown" 
ON public.countdown_timer 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));