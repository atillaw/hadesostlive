-- Create enum for chat status
CREATE TYPE public.chat_status AS ENUM ('waiting', 'active', 'closed');

-- Create enum for sender type
CREATE TYPE public.message_sender AS ENUM ('user', 'admin', 'ai');

-- Create support_chats table
CREATE TABLE public.support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  user_name TEXT,
  status chat_status NOT NULL DEFAULT 'waiting',
  mode TEXT NOT NULL, -- 'ai' or 'human'
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_messages table
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.support_chats(id) ON DELETE CASCADE,
  sender_type message_sender NOT NULL,
  sender_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_chats
CREATE POLICY "Anyone can create chats"
  ON public.support_chats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own chats"
  ON public.support_chats
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can view all chats"
  ON public.support_chats
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update chats"
  ON public.support_chats
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for support_messages
CREATE POLICY "Anyone can insert messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view messages in their chats"
  ON public.support_messages
  FOR SELECT
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_support_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_chats_updated_at
  BEFORE UPDATE ON public.support_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_chat_timestamp();