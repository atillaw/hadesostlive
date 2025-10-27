-- Create public chat messages table for memes page
CREATE TABLE public.meme_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  guest_username text,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX idx_meme_chat_messages_created_at ON public.meme_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.meme_chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read meme chat messages"
ON public.meme_chat_messages FOR SELECT
USING (true);

-- Anyone can insert messages (both authenticated and guest users)
CREATE POLICY "Anyone can send meme chat messages"
ON public.meme_chat_messages FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND guest_username IS NULL)
  OR (auth.uid() IS NULL AND guest_username IS NOT NULL)
  OR (user_id IS NULL AND guest_username IS NOT NULL)
);

-- Users can delete their own messages, admins can delete any
CREATE POLICY "Users can delete own meme chat messages"
ON public.meme_chat_messages FOR DELETE
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.meme_chat_messages;