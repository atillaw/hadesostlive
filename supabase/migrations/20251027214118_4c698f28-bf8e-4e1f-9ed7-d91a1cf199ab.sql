-- Create clip_likes table
CREATE TABLE public.clip_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_identifier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT clip_likes_unique_user UNIQUE (clip_id, user_id),
  CONSTRAINT clip_likes_unique_guest UNIQUE (clip_id, user_identifier),
  CONSTRAINT clip_likes_check_user CHECK (
    (user_id IS NOT NULL AND user_identifier IS NULL) OR
    (user_id IS NULL AND user_identifier IS NOT NULL)
  )
);

-- Create clip_comments table
CREATE TABLE public.clip_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_identifier TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT clip_comments_check_user CHECK (
    (user_id IS NOT NULL AND user_identifier IS NULL) OR
    (user_id IS NULL AND user_identifier IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.clip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clip_likes
CREATE POLICY "Anyone can view likes"
ON public.clip_likes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add likes"
ON public.clip_likes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete own likes"
ON public.clip_likes
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text))
);

-- RLS Policies for clip_comments
CREATE POLICY "Anyone can view comments"
ON public.clip_comments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add comments"
ON public.clip_comments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete own comments"
ON public.clip_comments
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text)) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clip_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clip_comments;