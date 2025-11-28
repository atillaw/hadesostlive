-- Create community_members table for membership system
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  role TEXT DEFAULT 'member', -- member, moderator, admin
  UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view community members"
  ON public.community_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join communities"
  ON public.community_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON public.community_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add maintenance_mode to site_settings if not exists
INSERT INTO public.site_settings (key, value, description)
VALUES ('maintenance_mode', 'false', 'Site bakım modu durumu')
ON CONFLICT (key) DO NOTHING;

-- Create function to update community member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = GREATEST(member_count - 1, 0)
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for member count
DROP TRIGGER IF EXISTS update_member_count_trigger ON public.community_members;
CREATE TRIGGER update_member_count_trigger
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_member_count();

-- Create function to detect mentions and create notifications
CREATE OR REPLACE FUNCTION public.create_mention_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_username TEXT;
  mentioned_user_id UUID;
  community_slug TEXT;
BEGIN
  -- Extract @mentions from content
  FOR mentioned_username IN 
    SELECT DISTINCT regexp_matches[1]
    FROM regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g') AS regexp_matches
  LOOP
    -- Find the mentioned user
    SELECT id INTO mentioned_user_id
    FROM public.profiles
    WHERE username = mentioned_username;
    
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
      -- Get community slug if it's a post
      IF TG_TABLE_NAME = 'posts' THEN
        SELECT slug INTO community_slug
        FROM public.communities
        WHERE id = NEW.community_id;
        
        INSERT INTO public.notifications (user_id, title, content, type, link)
        VALUES (
          mentioned_user_id,
          'Bir gönderide etiketlendiniz',
          NEW.author_username || ' sizi bir gönderide etiketledi',
          'mention',
          '/c/' || community_slug || '/post/' || NEW.id
        );
      ELSIF TG_TABLE_NAME = 'comments' THEN
        SELECT slug INTO community_slug
        FROM public.communities
        WHERE id = (SELECT community_id FROM posts WHERE id = NEW.post_id);
        
        INSERT INTO public.notifications (user_id, title, content, type, link)
        VALUES (
          mentioned_user_id,
          'Bir yorumda etiketlendiniz',
          NEW.author_username || ' sizi bir yorumda etiketledi',
          'mention',
          '/c/' || community_slug || '/post/' || NEW.post_id
        );
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create triggers for mention notifications
DROP TRIGGER IF EXISTS create_post_mentions_trigger ON public.posts;
CREATE TRIGGER create_post_mentions_trigger
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mention_notifications();

DROP TRIGGER IF EXISTS create_comment_mentions_trigger ON public.comments;
CREATE TRIGGER create_comment_mentions_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mention_notifications();