-- Add category column to vods table
ALTER TABLE vods ADD COLUMN IF NOT EXISTS category text DEFAULT 'Just Chatting';

-- Create stream_schedule table for upcoming streams
CREATE TABLE IF NOT EXISTS stream_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  scheduled_date timestamptz NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'Just Chatting',
  is_active boolean DEFAULT true
);

-- Create stream_reminders table
CREATE TABLE IF NOT EXISTS stream_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  schedule_id uuid NOT NULL REFERENCES stream_schedule(id) ON DELETE CASCADE,
  user_identifier text NOT NULL,
  user_email text,
  reminded boolean DEFAULT false,
  UNIQUE(schedule_id, user_identifier)
);

-- Create viewer_stats table for tracking viewer counts
CREATE TABLE IF NOT EXISTS viewer_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  viewer_count integer NOT NULL,
  is_live boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE stream_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewer_stats ENABLE ROW LEVEL SECURITY;

-- Policies for stream_schedule
CREATE POLICY "Anyone can view active schedules"
  ON stream_schedule FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage schedules"
  ON stream_schedule FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for stream_reminders
CREATE POLICY "Users can view own reminders"
  ON stream_reminders FOR SELECT
  USING (user_identifier = (current_setting('request.headers', true)::json->>'x-user-id'));

CREATE POLICY "Anyone can create reminders"
  ON stream_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own reminders"
  ON stream_reminders FOR DELETE
  USING (user_identifier = (current_setting('request.headers', true)::json->>'x-user-id'));

CREATE POLICY "Admins can view all reminders"
  ON stream_reminders FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Policies for viewer_stats
CREATE POLICY "Anyone can view viewer stats"
  ON viewer_stats FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert viewer stats"
  ON viewer_stats FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stream_schedule_date ON stream_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_viewer_stats_recorded_at ON viewer_stats(recorded_at);
CREATE INDEX IF NOT EXISTS idx_stream_reminders_schedule ON stream_reminders(schedule_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_stream_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_stream_schedule_timestamp
  BEFORE UPDATE ON stream_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_schedule_timestamp();