-- Add last_position to vod_views for resume playback
ALTER TABLE vod_views ADD COLUMN IF NOT EXISTS last_position INTEGER DEFAULT 0;

-- Add points_won to prediction_bets for reward tracking
ALTER TABLE prediction_bets ADD COLUMN IF NOT EXISTS points_won INTEGER DEFAULT 0;

-- Create leaderboard view for prediction game winners
CREATE OR REPLACE VIEW prediction_leaderboard AS
SELECT 
  user_identifier,
  SUM(points_won) as total_points,
  COUNT(*) as correct_predictions,
  COUNT(DISTINCT prediction_id) as games_played
FROM prediction_bets
WHERE points_won > 0
GROUP BY user_identifier
ORDER BY total_points DESC;

-- Add comment for clarity
COMMENT ON VIEW prediction_leaderboard IS 'Leaderboard showing top prediction game winners by total points earned';