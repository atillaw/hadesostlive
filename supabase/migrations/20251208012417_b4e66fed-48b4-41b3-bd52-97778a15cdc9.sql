
-- Create table for one-time connect tokens
CREATE TABLE public.kick_connect_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kick_user_id TEXT NOT NULL,
  kick_username TEXT NOT NULL,
  kick_display_name TEXT,
  kick_avatar_url TEXT,
  kick_channel_slug TEXT,
  token TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by_user_id UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Kick data captured at token generation
  kick_data JSONB DEFAULT '{}'::jsonb
);

-- Add additional columns to kick_accounts for extended data
ALTER TABLE public.kick_accounts 
ADD COLUMN IF NOT EXISTS is_follower BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_subscriber BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_og BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS verified_via TEXT DEFAULT 'oauth',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on kick_connect_tokens
ALTER TABLE public.kick_connect_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage tokens (bot API uses service role)
CREATE POLICY "Service role can manage connect tokens"
ON public.kick_connect_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for token lookup
CREATE INDEX idx_kick_connect_tokens_token ON public.kick_connect_tokens(token);
CREATE INDEX idx_kick_connect_tokens_kick_user_id ON public.kick_connect_tokens(kick_user_id);
CREATE INDEX idx_kick_connect_tokens_expires_at ON public.kick_connect_tokens(expires_at);

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_kick_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.kick_connect_tokens
  WHERE expires_at < now() AND is_used = false;
END;
$$;
