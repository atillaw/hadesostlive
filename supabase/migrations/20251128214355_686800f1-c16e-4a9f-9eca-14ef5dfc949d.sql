-- Add Kick connection columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kick_username TEXT,
ADD COLUMN IF NOT EXISTS kick_connected_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_kick_username ON public.profiles(kick_username);