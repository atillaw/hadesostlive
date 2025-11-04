-- Fix chat RLS policies by removing public fallback
-- This enforces proper session-based access control

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_chat_conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_chat_messages;

-- Create strict session-based policies for ai_chat_conversations
-- Uses only user_session_id without the OR true fallback
CREATE POLICY "Users can view own conversations"
ON public.ai_chat_conversations FOR SELECT
USING (
  user_session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR user_session_id = auth.uid()::text
);

-- Create strict session-based policies for ai_chat_messages  
CREATE POLICY "Users can view own messages"
ON public.ai_chat_messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.ai_chat_conversations 
    WHERE user_session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_session_id = auth.uid()::text
  )
);

-- Add INSERT policies for conversations and messages
CREATE POLICY "Users can insert own conversations"
ON public.ai_chat_conversations FOR INSERT
WITH CHECK (
  user_session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR user_session_id = auth.uid()::text
);

CREATE POLICY "Users can insert own messages"
ON public.ai_chat_messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.ai_chat_conversations 
    WHERE user_session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_session_id = auth.uid()::text
  )
);