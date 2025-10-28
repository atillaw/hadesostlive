-- Add follower_since column to kick_subscribers table
ALTER TABLE kick_subscribers 
ADD COLUMN follower_since timestamp with time zone;