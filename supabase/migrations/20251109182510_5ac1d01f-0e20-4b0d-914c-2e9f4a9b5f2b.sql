-- Drop existing policies for ai_chat_conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON ai_chat_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON ai_chat_conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON ai_chat_conversations;

-- Drop existing policies for ai_chat_messages  
DROP POLICY IF EXISTS "Users can view own messages" ON ai_chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON ai_chat_messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON ai_chat_messages;

-- Create simple public policies for ai_chat_conversations
CREATE POLICY "Public can insert conversations"
ON ai_chat_conversations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can view conversations"
ON ai_chat_conversations
FOR SELECT
TO public
USING (true);

-- Create simple public policies for ai_chat_messages
CREATE POLICY "Public can insert messages"
ON ai_chat_messages
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can view messages"
ON ai_chat_messages
FOR SELECT
TO public
USING (true);