-- Create kick_accounts table for secure token storage
CREATE TABLE public.kick_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  kick_user_id TEXT NOT NULL,
  kick_username TEXT NOT NULL,
  kick_channel_slug TEXT,
  kick_display_name TEXT,
  kick_avatar_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kick_oauth_states table for PKCE state management
CREATE TABLE public.kick_oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Enable RLS
ALTER TABLE public.kick_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kick_oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS policies for kick_accounts
CREATE POLICY "Users can view own kick account"
ON public.kick_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kick account"
ON public.kick_accounts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage kick accounts"
ON public.kick_accounts FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for kick_oauth_states
CREATE POLICY "Service role can manage oauth states"
ON public.kick_oauth_states FOR ALL
USING (true)
WITH CHECK (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_kick_accounts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updated_at
CREATE TRIGGER update_kick_accounts_updated_at
BEFORE UPDATE ON public.kick_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_kick_accounts_timestamp();

-- Index for faster lookups
CREATE INDEX idx_kick_accounts_user_id ON public.kick_accounts(user_id);
CREATE INDEX idx_kick_accounts_kick_username ON public.kick_accounts(kick_username);
CREATE INDEX idx_kick_oauth_states_state ON public.kick_oauth_states(state);
CREATE INDEX idx_kick_oauth_states_expires_at ON public.kick_oauth_states(expires_at);