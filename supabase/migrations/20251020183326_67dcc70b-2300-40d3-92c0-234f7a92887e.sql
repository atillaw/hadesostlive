-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create AI chat conversations table
CREATE TABLE IF NOT EXISTS public.ai_chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI chat messages table
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view conversations"
ON public.ai_chat_conversations
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create conversations"
ON public.ai_chat_conversations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.ai_chat_messages
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create messages"
ON public.ai_chat_messages
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_ai_chat_conversations_session ON public.ai_chat_conversations(user_session_id);
CREATE INDEX idx_ai_chat_messages_conversation ON public.ai_chat_messages(conversation_id);
CREATE INDEX idx_ai_chat_messages_created ON public.ai_chat_messages(created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_chat_conversations_updated_at
BEFORE UPDATE ON public.ai_chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();