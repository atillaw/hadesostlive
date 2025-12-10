-- Create kick_user_stats table for detailed user statistics
CREATE TABLE IF NOT EXISTS public.kick_user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kick_user_id TEXT NOT NULL,
  kick_username TEXT NOT NULL,
  
  -- Subscription Data
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  subscription_months INTEGER DEFAULT 0,
  subscription_streak INTEGER DEFAULT 0,
  renewal_cycle TEXT, -- 'monthly', 'yearly', 'gifted'
  total_gifted_subs INTEGER DEFAULT 0,
  
  -- Follow Data
  followed_at TIMESTAMP WITH TIME ZONE,
  follow_months INTEGER DEFAULT 0,
  
  -- Chat Stats
  total_messages INTEGER DEFAULT 0,
  messages_this_month INTEGER DEFAULT 0,
  most_active_hour INTEGER, -- 0-23
  most_active_day INTEGER, -- 0-6 (Sunday-Saturday)
  
  -- Activity Data
  total_watch_time_minutes INTEGER DEFAULT 0,
  watch_time_this_month INTEGER DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  
  -- Loyalty & Points
  loyalty_points INTEGER DEFAULT 0,
  channel_points INTEGER DEFAULT 0,
  
  -- Donations & Support
  total_donations NUMERIC(10,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  last_donation_at TIMESTAMP WITH TIME ZONE,
  
  -- Badges
  badges JSONB DEFAULT '[]'::jsonb,
  special_badges JSONB DEFAULT '[]'::jsonb,
  
  -- Monthly Activity History (last 12 months)
  monthly_activity JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, kick_user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_kick_user_stats_user_id ON public.kick_user_stats(user_id);
CREATE INDEX idx_kick_user_stats_kick_user_id ON public.kick_user_stats(kick_user_id);
CREATE INDEX idx_kick_user_stats_subscription_months ON public.kick_user_stats(subscription_months DESC);

-- Enable RLS
ALTER TABLE public.kick_user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stats"
ON public.kick_user_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats"
ON public.kick_user_stats
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage stats"
ON public.kick_user_stats
FOR ALL
USING (true)
WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_kick_user_stats_timestamp
BEFORE UPDATE ON public.kick_user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create channel_subscriber_summary view for admin dashboard
CREATE OR REPLACE VIEW public.channel_subscriber_summary AS
SELECT 
  subscription_months,
  COUNT(*) as subscriber_count,
  AVG(total_messages)::INTEGER as avg_messages,
  AVG(loyalty_points)::INTEGER as avg_loyalty_points,
  SUM(total_donations) as total_donations
FROM public.kick_user_stats
WHERE subscription_months > 0
GROUP BY subscription_months
ORDER BY subscription_months DESC;

-- Grant access to views
GRANT SELECT ON public.channel_subscriber_summary TO anon, authenticated;

-- Enable realtime for kick_user_stats
ALTER PUBLICATION supabase_realtime ADD TABLE public.kick_user_stats;