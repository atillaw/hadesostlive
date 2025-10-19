-- Create table for Kick subscribers
CREATE TABLE public.kick_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  subscription_tier text NOT NULL,
  subscription_type text,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kick_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view subscribers
CREATE POLICY "Anyone can view subscribers"
ON public.kick_subscribers
FOR SELECT
USING (true);

-- Only admins can insert/delete subscribers (via backend function)
CREATE POLICY "Admins can insert subscribers"
ON public.kick_subscribers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscribers"
ON public.kick_subscribers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_kick_subscribers_subscribed_at ON public.kick_subscribers(subscribed_at DESC);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.kick_subscribers;