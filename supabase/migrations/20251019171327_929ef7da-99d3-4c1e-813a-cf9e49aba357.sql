-- Fix search_path for update_support_chat_timestamp function
DROP TRIGGER IF EXISTS update_support_chats_updated_at ON public.support_chats;
DROP FUNCTION IF EXISTS public.update_support_chat_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_support_chat_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_support_chats_updated_at
  BEFORE UPDATE ON public.support_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_chat_timestamp();