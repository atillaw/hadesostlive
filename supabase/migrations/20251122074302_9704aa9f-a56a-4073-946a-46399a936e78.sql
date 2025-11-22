-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  requirement_type TEXT NOT NULL, -- 'score', 'games_played', 'win_rate', etc.
  requirement_value INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_identifier, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all achievements"
  ON public.user_achievements FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some default achievements
INSERT INTO public.achievements (title, description, icon, requirement_type, requirement_value, points) VALUES
  ('İlk Adım', 'İlk mini oyununu tamamla', '🎯', 'games_played', 1, 10),
  ('Deneyimli Oyuncu', '10 mini oyun tamamla', '🎮', 'games_played', 10, 50),
  ('Mini Oyun Ustası', '50 mini oyun tamamla', '👑', 'games_played', 50, 200),
  ('Yüksek Skor', '500 ve üzeri skor al', '⭐', 'score', 500, 25),
  ('Efsanevi Skor', '1000 puan skoruna ulaş', '💫', 'score', 1000, 100),
  ('Tahmin Dehası', '5 doğru tahmin yap', '🔮', 'correct_predictions', 5, 50),
  ('Kehanet Ustası', '20 doğru tahmin yap', '🌟', 'correct_predictions', 20, 200);