-- Drop the old view
DROP VIEW IF EXISTS public.vod_stats;

-- Recreate view without security definer (it's not needed for this public data)
CREATE VIEW public.vod_stats AS
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