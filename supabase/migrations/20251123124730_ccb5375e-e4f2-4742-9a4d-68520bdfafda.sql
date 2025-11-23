-- Create security_logs table for comprehensive security event tracking
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security logs"
ON public.security_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert security logs (for edge functions)
CREATE POLICY "System can insert security logs"
ON public.security_logs
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_ip_address ON public.security_logs(ip_address);

-- Create rate_limit_tracking table for IP-based rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ip_address, endpoint)
);

-- Enable RLS on rate_limit_tracking
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limit_tracking
FOR ALL
USING (true)
WITH CHECK (true);

-- Add user_id column to prediction_bets if not exists
ALTER TABLE public.prediction_bets 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for prediction_bets user_id
CREATE INDEX IF NOT EXISTS idx_prediction_bets_user_id ON public.prediction_bets(user_id);

-- Drop old policies on prediction_bets
DROP POLICY IF EXISTS "Anyone can place bets" ON public.prediction_bets;
DROP POLICY IF EXISTS "Anyone can view active predictions" ON public.prediction_bets;

-- Create new policies for authenticated prediction bets
CREATE POLICY "Authenticated users can place bets"
ON public.prediction_bets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 FROM public.prediction_bets
    WHERE prediction_id = prediction_bets.prediction_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view all bets"
ON public.prediction_bets
FOR SELECT
USING (true);

-- Update prediction_leaderboard view to use user_id
DROP VIEW IF EXISTS public.prediction_leaderboard;

CREATE VIEW public.prediction_leaderboard AS
SELECT 
  user_id,
  COALESCE(SUM(points_won), 0) as total_points,
  COUNT(CASE WHEN points_won > 0 THEN 1 END) as correct_predictions,
  COUNT(*) as games_played
FROM public.prediction_bets
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY total_points DESC;