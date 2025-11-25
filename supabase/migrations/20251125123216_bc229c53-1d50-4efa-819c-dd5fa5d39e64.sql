-- Create storage bucket for forum media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forum-media', 'forum-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for forum media
CREATE POLICY "Anyone can view forum media" ON storage.objects
  FOR SELECT USING (bucket_id = 'forum-media');

CREATE POLICY "Authenticated users can upload forum media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'forum-media' AND 
    (auth.uid() IS NOT NULL OR auth.role() = 'anon')
  );

CREATE POLICY "Users can delete own forum media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'forum-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Forum Mentions table
CREATE TABLE public.forum_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.forum_entries(id) ON DELETE CASCADE NOT NULL,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Notifications table
CREATE TABLE public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('mention', 'reply', 'quote', 'vote')),
  entry_id UUID REFERENCES public.forum_entries(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  actor_username TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Media table
CREATE TABLE public.forum_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.forum_entries(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'link')),
  file_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Bookmarks table
CREATE TABLE public.forum_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Forum Tags table
CREATE TABLE public.forum_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Topic Tags mapping
CREATE TABLE public.forum_topic_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.forum_tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(topic_id, tag_id)
);

-- Indexes
CREATE INDEX idx_forum_mentions_user ON public.forum_mentions(mentioned_user_id);
CREATE INDEX idx_forum_notifications_user ON public.forum_notifications(user_id, is_read);
CREATE INDEX idx_forum_notifications_created ON public.forum_notifications(created_at DESC);
CREATE INDEX idx_forum_media_entry ON public.forum_media(entry_id);
CREATE INDEX idx_forum_bookmarks_user ON public.forum_bookmarks(user_id);
CREATE INDEX idx_forum_tags_slug ON public.forum_tags(slug);
CREATE INDEX idx_forum_topic_tags_topic ON public.forum_topic_tags(topic_id);
CREATE INDEX idx_forum_topic_tags_tag ON public.forum_topic_tags(tag_id);

-- Enable RLS
ALTER TABLE public.forum_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Mentions
CREATE POLICY "Anyone can view mentions" ON public.forum_mentions
  FOR SELECT USING (true);

CREATE POLICY "System can create mentions" ON public.forum_mentions
  FOR INSERT WITH CHECK (true);

-- RLS Policies: Notifications
CREATE POLICY "Users can view own notifications" ON public.forum_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.forum_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.forum_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: Media
CREATE POLICY "Anyone can view forum media" ON public.forum_media
  FOR SELECT USING (true);

CREATE POLICY "Anyone can upload media" ON public.forum_media
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can delete media" ON public.forum_media
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.forum_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON public.forum_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: Tags
CREATE POLICY "Anyone can view tags" ON public.forum_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON public.forum_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage tags" ON public.forum_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies: Topic Tags
CREATE POLICY "Anyone can view topic tags" ON public.forum_topic_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage topic tags" ON public.forum_topic_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forum_topics 
      WHERE id = topic_id AND (author_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- Function to create notification on mention
CREATE OR REPLACE FUNCTION create_mention_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mentioned_user_id IS NOT NULL THEN
    INSERT INTO forum_notifications (
      user_id, 
      notification_type, 
      entry_id,
      topic_id,
      actor_username
    )
    SELECT 
      NEW.mentioned_user_id,
      'mention',
      NEW.entry_id,
      e.topic_id,
      e.author_username
    FROM forum_entries e
    WHERE e.id = NEW.entry_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_mention_notification_trigger
AFTER INSERT ON public.forum_mentions
FOR EACH ROW EXECUTE FUNCTION create_mention_notification();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_tags 
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_tags 
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_tag_usage_count_trigger
AFTER INSERT OR DELETE ON public.forum_topic_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();