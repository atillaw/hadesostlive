-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule VOD scraping to run every 24 hours at midnight UTC
SELECT cron.schedule(
  'scrape-kick-vods-daily',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://txinupgxlqagjyshvxty.supabase.co/functions/v1/scrape-kick-vods',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aW51cGd4bHFhZ2p5c2h2eHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg3NTMsImV4cCI6MjA3NjAzNDc1M30.WybfdaMbQ7AX1gJ9ZRIgwOoUk0RqLBx8cI9KhhOR8nQ"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);