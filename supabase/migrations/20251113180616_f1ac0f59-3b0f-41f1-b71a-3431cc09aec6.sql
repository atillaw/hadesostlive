-- VOD Tags System
CREATE TABLE IF NOT EXISTS public.vod_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vod_tag_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vod_id UUID NOT NULL REFERENCES public.vods(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.vod_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vod_id, tag_id)
);

-- VOD Views History
CREATE TABLE IF NOT EXISTS public.vod_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vod_id UUID NOT NULL REFERENCES public.vods(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration INTEGER DEFAULT 0, -- seconds watched
  completed BOOLEAN DEFAULT false
);

-- Add duration to VODs
ALTER TABLE public.vods ADD COLUMN IF NOT EXISTS duration INTEGER; -- duration in seconds

-- Prediction Games
CREATE TABLE IF NOT EXISTS public.prediction_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of option objects
  correct_option_index INTEGER,
  status TEXT NOT NULL DEFAULT 'active', -- active, closed, resolved
  closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prediction_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.prediction_games(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  points_wagered INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prediction_id, user_identifier)
);

-- Mini Games
CREATE TABLE IF NOT EXISTS public.mini_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL, -- trivia, reaction, memory, etc.
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.mini_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.mini_games(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vod_views_user ON public.vod_views(user_identifier);
CREATE INDEX IF NOT EXISTS idx_vod_views_vod ON public.vod_views(vod_id);
CREATE INDEX IF NOT EXISTS idx_vod_views_watched_at ON public.vod_views(watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_bets_user ON public.prediction_bets(user_identifier);
CREATE INDEX IF NOT EXISTS idx_mini_game_scores_game ON public.mini_game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_mini_game_scores_user ON public.mini_game_scores(user_identifier);
CREATE INDEX IF NOT EXISTS idx_viewer_stats_recorded_at ON public.viewer_stats(recorded_at DESC);

-- RLS Policies
ALTER TABLE public.vod_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vod_tag_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vod_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mini_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mini_game_scores ENABLE ROW LEVEL SECURITY;

-- VOD Tags Policies
CREATE POLICY "Anyone can view tags" ON public.vod_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.vod_tags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view tag mappings" ON public.vod_tag_mappings FOR SELECT USING (true);
CREATE POLICY "Admins can manage tag mappings" ON public.vod_tag_mappings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- VOD Views Policies
CREATE POLICY "Anyone can insert views" ON public.vod_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own history" ON public.vod_views FOR SELECT USING (true);
CREATE POLICY "Admins can view all views" ON public.vod_views FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Prediction Games Policies
CREATE POLICY "Anyone can view active predictions" ON public.prediction_games FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage predictions" ON public.prediction_games FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can place bets" ON public.prediction_bets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view bets" ON public.prediction_bets FOR SELECT USING (true);

-- Mini Games Policies
CREATE POLICY "Anyone can view active games" ON public.mini_games FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage games" ON public.mini_games FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit scores" ON public.mini_game_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view scores" ON public.mini_game_scores FOR SELECT USING (true);

-- Create views for statistics
CREATE OR REPLACE VIEW public.viewer_stats_hourly AS
SELECT 
  date_trunc('hour', recorded_at) as hour,
  AVG(viewer_count) as avg_viewers,
  MAX(viewer_count) as peak_viewers,
  MIN(viewer_count) as min_viewers,
  COUNT(*) as data_points
FROM public.viewer_stats
WHERE is_live = true
GROUP BY date_trunc('hour', recorded_at)
ORDER BY hour DESC;

CREATE OR REPLACE VIEW public.viewer_stats_daily AS
SELECT 
  date_trunc('day', recorded_at) as day,
  AVG(viewer_count) as avg_viewers,
  MAX(viewer_count) as peak_viewers,
  MIN(viewer_count) as min_viewers,
  COUNT(*) as data_points
FROM public.viewer_stats
WHERE is_live = true
GROUP BY date_trunc('day', recorded_at)
ORDER BY day DESC;

CREATE OR REPLACE VIEW public.viewer_stats_weekly AS
SELECT 
  date_trunc('week', recorded_at) as week,
  AVG(viewer_count) as avg_viewers,
  MAX(viewer_count) as peak_viewers,
  MIN(viewer_count) as min_viewers,
  COUNT(*) as data_points
FROM public.viewer_stats
WHERE is_live = true
GROUP BY date_trunc('week', recorded_at)
ORDER BY week DESC;

CREATE OR REPLACE VIEW public.viewer_stats_monthly AS
SELECT 
  date_trunc('month', recorded_at) as month,
  AVG(viewer_count) as avg_viewers,
  MAX(viewer_count) as peak_viewers,
  MIN(viewer_count) as min_viewers,
  COUNT(*) as data_points
FROM public.viewer_stats
WHERE is_live = true
GROUP BY date_trunc('month', recorded_at)
ORDER BY month DESC;

-- Trigger for prediction_games updated_at
CREATE OR REPLACE FUNCTION public.update_prediction_games_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_prediction_games_updated_at
BEFORE UPDATE ON public.prediction_games
FOR EACH ROW
EXECUTE FUNCTION public.update_prediction_games_timestamp();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.prediction_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prediction_bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mini_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mini_game_scores;