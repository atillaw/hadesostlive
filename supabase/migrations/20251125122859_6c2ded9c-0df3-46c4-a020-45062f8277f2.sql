-- Forum Categories
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Topics
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  entry_count INTEGER DEFAULT 0,
  last_entry_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Forum Entries
CREATE TABLE public.forum_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  content TEXT NOT NULL,
  content_html TEXT,
  parent_entry_id UUID REFERENCES public.forum_entries(id) ON DELETE SET NULL,
  quoted_entry_id UUID REFERENCES public.forum_entries(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Votes
CREATE TABLE public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.forum_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_identifier TEXT,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, user_id),
  UNIQUE(entry_id, user_identifier)
);

-- Forum Reports
CREATE TABLE public.forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('entry', 'topic', 'user')),
  target_id UUID NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_identifier TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Bans
CREATE TABLE public.forum_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Settings
CREATE TABLE public.forum_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_forum_topics_category ON public.forum_topics(category_id);
CREATE INDEX idx_forum_topics_created ON public.forum_topics(created_at DESC);
CREATE INDEX idx_forum_topics_last_entry ON public.forum_topics(last_entry_at DESC);
CREATE INDEX idx_forum_entries_topic ON public.forum_entries(topic_id);
CREATE INDEX idx_forum_entries_created ON public.forum_entries(created_at DESC);
CREATE INDEX idx_forum_votes_entry ON public.forum_votes(entry_id);
CREATE INDEX idx_forum_reports_status ON public.forum_reports(status);
CREATE INDEX idx_forum_bans_user ON public.forum_bans(user_id);
CREATE INDEX idx_forum_bans_ip ON public.forum_bans(ip_address);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Categories
CREATE POLICY "Anyone can view active categories" ON public.forum_categories
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage categories" ON public.forum_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Topics
CREATE POLICY "Anyone can view non-deleted topics" ON public.forum_topics
  FOR SELECT USING (is_deleted = false OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous = true);

CREATE POLICY "Authors and admins can update topics" ON public.forum_topics
  FOR UPDATE USING (
    auth.uid() = author_id OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete topics" ON public.forum_topics
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Entries
CREATE POLICY "Anyone can view non-deleted entries" ON public.forum_entries
  FOR SELECT USING (is_deleted = false OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create entries" ON public.forum_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authors and admins can update entries" ON public.forum_entries
  FOR UPDATE USING (
    auth.uid() = author_id OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete entries" ON public.forum_entries
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Votes
CREATE POLICY "Anyone can view votes" ON public.forum_votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can vote" ON public.forum_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own votes" ON public.forum_votes
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text))
  );

CREATE POLICY "Users can delete own votes" ON public.forum_votes
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text))
  );

-- RLS Policies: Reports
CREATE POLICY "Anyone can create reports" ON public.forum_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all reports" ON public.forum_reports
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" ON public.forum_reports
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Bans
CREATE POLICY "Admins can manage bans" ON public.forum_bans
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Settings
CREATE POLICY "Anyone can view settings" ON public.forum_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.forum_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON public.forum_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_entries_updated_at BEFORE UPDATE ON public.forum_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_settings_updated_at BEFORE UPDATE ON public.forum_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update topic entry count
CREATE OR REPLACE FUNCTION update_topic_entry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics 
    SET entry_count = entry_count + 1,
        last_entry_at = NEW.created_at
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics 
    SET entry_count = GREATEST(entry_count - 1, 0)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_topic_entry_count_trigger
AFTER INSERT OR DELETE ON public.forum_entries
FOR EACH ROW EXECUTE FUNCTION update_topic_entry_count();

-- Function to update entry vote score
CREATE OR REPLACE FUNCTION update_entry_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_entries 
    SET vote_score = vote_score + NEW.vote_type
    WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE forum_entries 
    SET vote_score = vote_score - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_entries 
    SET vote_score = vote_score - OLD.vote_type
    WHERE id = OLD.entry_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_entry_vote_score_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.forum_votes
FOR EACH ROW EXECUTE FUNCTION update_entry_vote_score();

-- Insert default categories
INSERT INTO public.forum_categories (name, slug, description, icon, display_order) VALUES
  ('Genel', 'genel', 'Genel konular ve sohbet', '💬', 1),
  ('Teknoloji', 'teknoloji', 'Teknoloji haberleri ve tartışmaları', '💻', 2),
  ('Oyun', 'oyun', 'Video oyunları ve gaming', '🎮', 3),
  ('Bilim', 'bilim', 'Bilim ve araştırma', '🔬', 4),
  ('Sanat', 'sanat', 'Sanat, müzik ve kültür', '🎨', 5);

-- Insert default settings
INSERT INTO public.forum_settings (key, value, description) VALUES
  ('site_name', '"Forum"', 'Site adı'),
  ('allow_anonymous_posts', 'true', 'Anonim gönderi izni'),
  ('posts_per_page', '20', 'Sayfa başına gönderi sayısı'),
  ('require_approval', 'false', 'Gönderilerin onay gerektirip gerektirmediği');