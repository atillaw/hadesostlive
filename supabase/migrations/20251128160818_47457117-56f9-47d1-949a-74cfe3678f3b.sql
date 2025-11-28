-- Create conversations table for direct messaging
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 < participant_2)
);

-- Create direct messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- RLS Policies for direct_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.direct_messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = participant_1 OR auth.uid() = participant_2
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = participant_1 OR auth.uid() = participant_2
  )
);

CREATE POLICY "Users can update their own messages"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating conversation timestamp
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Function to create notification for new comment reply
CREATE OR REPLACE FUNCTION create_comment_reply_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify parent comment author
  IF NEW.parent_comment_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, content, type, link)
    SELECT 
      author_id,
      'Yorumunuza Cevap',
      NEW.author_username || ' yorumunuza cevap verdi',
      'comment_reply',
      '/c/' || (SELECT slug FROM communities WHERE id = (SELECT community_id FROM posts WHERE id = NEW.post_id)) || '/' || NEW.post_id
    FROM comments
    WHERE id = NEW.parent_comment_id AND author_id IS NOT NULL AND author_id != NEW.author_id;
  END IF;
  
  -- Notify post author about new comment
  IF NEW.parent_comment_id IS NULL THEN
    INSERT INTO public.notifications (user_id, title, content, type, link)
    SELECT 
      author_id,
      'Yeni Yorum',
      NEW.author_username || ' gönderinize yorum yaptı',
      'post_comment',
      '/c/' || (SELECT slug FROM communities WHERE id = p.community_id) || '/' || p.id
    FROM posts p
    WHERE p.id = NEW.post_id AND p.author_id IS NOT NULL AND p.author_id != NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for comment reply notifications
CREATE TRIGGER notify_comment_reply
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_reply_notification();

-- Function to create notification for new follower
CREATE OR REPLACE FUNCTION create_follower_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, content, type, link)
  SELECT 
    NEW.following_id,
    'Yeni Takipçi',
    (SELECT username FROM profiles WHERE id = NEW.follower_id) || ' sizi takip etmeye başladı',
    'new_follower',
    '/kullanici/' || (SELECT username FROM profiles WHERE id = NEW.follower_id)
  WHERE EXISTS (SELECT 1 FROM profiles WHERE id = NEW.follower_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for follower notifications
CREATE TRIGGER notify_new_follower
AFTER INSERT ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION create_follower_notification();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for direct_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;