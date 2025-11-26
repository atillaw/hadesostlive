-- Drop old forum tables
DROP TABLE IF EXISTS forum_topic_tags CASCADE;
DROP TABLE IF EXISTS forum_tags CASCADE;
DROP TABLE IF EXISTS forum_bookmarks CASCADE;
DROP TABLE IF EXISTS forum_media CASCADE;
DROP TABLE IF EXISTS forum_mentions CASCADE;
DROP TABLE IF EXISTS forum_notifications CASCADE;
DROP TABLE IF EXISTS forum_votes CASCADE;
DROP TABLE IF EXISTS forum_entries CASCADE;
DROP TABLE IF EXISTS forum_topics CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS forum_reports CASCADE;
DROP TABLE IF EXISTS forum_bans CASCADE;
DROP TABLE IF EXISTS forum_settings CASCADE;

-- Universities (community hubs)
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  city TEXT,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- University moderators
CREATE TABLE university_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_by UUID,
  permissions JSONB DEFAULT '{"can_ban": true, "can_approve": true, "can_pin": true, "can_lock": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(university_id, user_id)
);

-- Posts (main content)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  author_id UUID,
  author_username TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  media_urls TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  is_shadowbanned BOOLEAN DEFAULT false,
  approval_required BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments (replies to posts)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID,
  author_username TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  media_urls TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  is_shadowbanned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Votes (upvote/downvote)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_identifier TEXT,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 downvote, 1 upvote
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT vote_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- User bans (enhanced)
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  is_shadowban BOOLEAN DEFAULT false,
  is_permanent BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID,
  reporter_identifier TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Post approval queue
CREATE TABLE post_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  flagged_by TEXT DEFAULT 'auto_filter',
  reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('upvote', 'comment', 'reply', 'mention', 'mod_action')),
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY NOT NULL,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  email_notifications BOOLEAN DEFAULT true,
  show_nsfw BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for universities
CREATE POLICY "Anyone can view active universities"
  ON universities FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage universities"
  ON universities FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- RLS Policies for posts
CREATE POLICY "Anyone can view approved posts"
  ON posts FOR SELECT
  USING (
    (is_approved = true AND is_deleted = false AND is_shadowbanned = false) OR
    auth.uid() = author_id OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'global_mod')
  );

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and mods can update posts"
  ON posts FOR UPDATE
  USING (
    auth.uid() = author_id OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'global_mod') OR
    EXISTS (
      SELECT 1 FROM university_moderators 
      WHERE university_id = posts.university_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Mods can delete posts"
  ON posts FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'global_mod') OR
    EXISTS (
      SELECT 1 FROM university_moderators 
      WHERE university_id = posts.university_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for comments
CREATE POLICY "Anyone can view non-deleted comments"
  ON comments FOR SELECT
  USING (
    (is_deleted = false AND is_shadowbanned = false) OR
    auth.uid() = author_id OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'global_mod')
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and mods can update comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'global_mod'));

CREATE POLICY "Mods can delete comments"
  ON comments FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'global_mod'));

-- RLS Policies for votes
CREATE POLICY "Users can view all votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create votes"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR user_identifier IS NOT NULL);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for other tables
CREATE POLICY "Admins can manage bans"
  ON user_bans FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'global_mod'));

CREATE POLICY "Anyone can create reports"
  ON reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Mods can view reports"
  ON reports FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'global_mod'));

CREATE POLICY "Mods can update reports"
  ON reports FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'global_mod'));

CREATE POLICY "Mods can manage post queue"
  ON post_queue FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'global_mod'));

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      IF NEW.vote_type = 1 THEN
        UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
      ELSE
        UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      IF OLD.vote_type = 1 THEN
        UPDATE posts SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.post_id;
      ELSE
        UPDATE posts SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.post_id IS NOT NULL AND OLD.vote_type != NEW.vote_type THEN
      IF OLD.vote_type = 1 THEN
        UPDATE posts SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 WHERE id = NEW.post_id;
      ELSE
        UPDATE posts SET downvotes = GREATEST(downvotes - 1, 0), upvotes = upvotes + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_post_votes
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      IF NEW.vote_type = 1 THEN
        UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
      ELSE
        UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 1 THEN
        UPDATE comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
      ELSE
        UPDATE comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.comment_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.comment_id IS NOT NULL AND OLD.vote_type != NEW.vote_type THEN
      IF OLD.vote_type = 1 THEN
        UPDATE comments SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      ELSE
        UPDATE comments SET downvotes = GREATEST(downvotes - 1, 0), upvotes = upvotes + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_comment_votes
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_vote_counts();

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_post_comments
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- Insert sample Turkish universities
INSERT INTO universities (name, slug, description, city) VALUES
  ('Boğaziçi Üniversitesi', 'bogazici', 'Boğaziçi Üniversitesi öğrenci topluluğu', 'İstanbul'),
  ('ODTÜ', 'odtu', 'Orta Doğu Teknik Üniversitesi topluluğu', 'Ankara'),
  ('İTÜ', 'itu', 'İstanbul Teknik Üniversitesi topluluğu', 'İstanbul'),
  ('Koç Üniversitesi', 'koc', 'Koç Üniversitesi öğrenci topluluğu', 'İstanbul'),
  ('Sabancı Üniversitesi', 'sabanci', 'Sabancı Üniversitesi topluluğu', 'İstanbul'),
  ('Bilkent Üniversitesi', 'bilkent', 'Bilkent Üniversitesi topluluğu', 'Ankara'),
  ('Hacettepe Üniversitesi', 'hacettepe', 'Hacettepe Üniversitesi topluluğu', 'Ankara'),
  ('İstanbul Üniversitesi', 'istanbul', 'İstanbul Üniversitesi topluluğu', 'İstanbul'),
  ('Ankara Üniversitesi', 'ankara', 'Ankara Üniversitesi topluluğu', 'Ankara'),
  ('Ege Üniversitesi', 'ege', 'Ege Üniversitesi topluluğu', 'İzmir');