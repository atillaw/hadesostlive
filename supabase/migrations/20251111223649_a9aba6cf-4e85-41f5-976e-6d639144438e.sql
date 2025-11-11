-- Recreate view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS vod_stats;

CREATE OR REPLACE VIEW vod_stats 
WITH (security_invoker = true)
AS
SELECT 
  v.id,
  v.title,
  v.thumbnail_url,
  v.video_url,
  v.created_at,
  v.category,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as vote_count
FROM vods v
LEFT JOIN vod_ratings r ON v.id = r.vod_id
GROUP BY v.id, v.title, v.thumbnail_url, v.video_url, v.created_at, v.category;