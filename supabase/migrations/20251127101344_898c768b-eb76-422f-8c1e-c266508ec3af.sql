-- Transform university-based forum to general Reddit-style community forum

-- Drop all policies that depend on university_id
DROP POLICY IF EXISTS "Anyone can view non-deleted posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Authors and mods can update posts" ON posts;
DROP POLICY IF EXISTS "Mods can delete posts" ON posts;

-- Drop university-specific constraints
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_university_id_fkey;
ALTER TABLE university_moderators DROP CONSTRAINT IF EXISTS university_moderators_university_id_fkey;

-- Rename universities to communities
ALTER TABLE universities RENAME TO communities;
ALTER TABLE communities DROP COLUMN IF EXISTS city;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS description_long TEXT;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'::jsonb;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#FF4500';

-- Update posts table
ALTER TABLE posts DROP COLUMN IF EXISTS university_id CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- Rename university_moderators to community_moderators
ALTER TABLE university_moderators RENAME TO community_moderators;
ALTER TABLE community_moderators RENAME COLUMN university_id TO community_id;
ALTER TABLE community_moderators ADD CONSTRAINT community_moderators_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE;

-- Update user_bans table
ALTER TABLE user_bans DROP COLUMN IF EXISTS university_id CASCADE;
ALTER TABLE user_bans ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- Update RLS policies for communities
DROP POLICY IF EXISTS "Admins can manage universities" ON communities;
DROP POLICY IF EXISTS "Anyone can view active universities" ON communities;

CREATE POLICY "Admins can manage communities"
  ON communities FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view active communities"
  ON communities FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Recreate posts policies with community_id
CREATE POLICY "Anyone can view non-deleted posts"
  ON posts FOR SELECT
  USING (
    (is_deleted = false AND is_shadowbanned = false AND is_approved = true) 
    OR auth.uid() = author_id 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'global_mod'::app_role)
  );

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and mods can update posts"
  ON posts FOR UPDATE
  USING (
    auth.uid() = author_id 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'global_mod'::app_role)
  );

CREATE POLICY "Mods can delete posts"
  ON posts FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'global_mod'::app_role)
  );

-- Update community_moderators policies
DROP POLICY IF EXISTS "Moderators can view their assignments" ON community_moderators;

CREATE POLICY "Admins can manage community moderators"
  ON community_moderators FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Moderators can view their assignments"
  ON community_moderators FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Clear old university data and insert general communities
DELETE FROM communities;

-- Insert general forum communities (Reddit-style)
INSERT INTO communities (name, slug, description, description_long, icon_url, theme_color, is_active) VALUES
('Genel', 'genel', 'Genel sohbet ve tartışmalar', 'Her konuda özgürce konuşabileceğiniz genel tartışma alanı', '🗣️', '#FF4500', true),
('Teknoloji', 'teknoloji', 'Teknoloji haberleri ve tartışmaları', 'Yazılım, donanım, yapay zeka ve tüm teknoloji konuları', '💻', '#0079D3', true),
('Oyun', 'oyun', 'Video oyunları ve gaming', 'PC, konsol, mobile oyunlar ve gaming kültürü', '🎮', '#7289DA', true),
('Spor', 'spor', 'Spor haberleri ve tartışmaları', 'Futbol, basketbol ve tüm spor dalları', '⚽', '#00A82D', true),
('Eğlence', 'eglence', 'Film, dizi, müzik ve eğlence', 'Popüler kültür, film, dizi, müzik tartışmaları', '🎬', '#FF6600', true),
('Bilim', 'bilim', 'Bilim ve araştırma', 'Bilimsel gelişmeler, araştırmalar ve tartışmalar', '🔬', '#00B5AD', true),
('Sanat', 'sanat', 'Sanat ve tasarım', 'Görsel sanatlar, müzik, edebiyat ve yaratıcı içerikler', '🎨', '#E91E63', true),
('Siyaset', 'siyaset', 'Siyasi tartışmalar', 'Güncel siyasi olaylar ve tartışmalar (saygılı tartışma ortamı)', '🏛️', '#673AB7', true),
('Ekonomi', 'ekonomi', 'Ekonomi ve finans', 'Borsa, kripto, ekonomik gelişmeler', '💰', '#FFC107', true),
('Sağlık', 'saglik', 'Sağlık ve fitness', 'Sağlıklı yaşam, beslenme, egzersiz', '💪', '#4CAF50', true);