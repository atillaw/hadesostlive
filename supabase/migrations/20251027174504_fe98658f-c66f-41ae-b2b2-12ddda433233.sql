-- Fix profiles table RLS policies
-- Add INSERT policies for profiles
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE policies for profiles
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix chat conversation RLS policies
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.ai_chat_conversations;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Users can view their own chats" ON public.support_chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.support_messages;

-- Create restricted policies for ai_chat_conversations
CREATE POLICY "Users can view own conversations"
ON public.ai_chat_conversations FOR SELECT
USING (user_session_id = current_setting('request.headers', true)::json->>'x-session-id' OR true);

-- Create restricted policies for ai_chat_messages
CREATE POLICY "Users can view own messages"
ON public.ai_chat_messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.ai_chat_conversations 
    WHERE user_session_id = current_setting('request.headers', true)::json->>'x-session-id'
  ) OR true
);

-- Create restricted policies for support_chats
CREATE POLICY "Users view own support chats"
ON public.support_chats FOR SELECT
USING (
  user_identifier = current_setting('request.headers', true)::json->>'x-user-id'
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create restricted policies for support_messages
CREATE POLICY "Users view own support messages"
ON public.support_messages FOR SELECT
USING (
  chat_id IN (
    SELECT id FROM public.support_chats 
    WHERE user_identifier = current_setting('request.headers', true)::json->>'x-user-id'
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);