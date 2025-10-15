-- Create VODs table
CREATE TABLE public.vods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.vod_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vod_id UUID NOT NULL REFERENCES public.vods(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vod_id, user_identifier)
);

-- Enable RLS
ALTER TABLE public.vods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vod_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for VODs (public read, no write for now - we'll add admin later if needed)
CREATE POLICY "VODs are viewable by everyone" 
ON public.vods 
FOR SELECT 
USING (true);

-- RLS Policies for ratings (public read and insert)
CREATE POLICY "Ratings are viewable by everyone" 
ON public.vod_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can rate VODs" 
ON public.vod_ratings 
FOR INSERT 
WITH CHECK (true);

-- Create view for VOD statistics
CREATE OR REPLACE VIEW public.vod_stats AS
SELECT 
  v.id,
  v.title,
  v.thumbnail_url,
  v.video_url,
  v.created_at,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as vote_count
FROM public.vods v
LEFT JOIN public.vod_ratings r ON v.id = r.vod_id
GROUP BY v.id, v.title, v.thumbnail_url, v.video_url, v.created_at;