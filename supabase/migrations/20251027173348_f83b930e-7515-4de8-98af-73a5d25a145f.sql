-- Create clips storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clips',
  'clips',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg']
);

-- Create clip_category enum
CREATE TYPE public.clip_category AS ENUM ('gameplay', 'funny', 'music', 'other');

-- Create clips table
CREATE TABLE public.clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  category clip_category NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'pending',
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Create admin_logs table
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on clips table
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- Enable RLS on admin_logs table
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clips
CREATE POLICY "Anyone can upload clips"
  ON public.clips
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved clips"
  ON public.clips
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can view all clips"
  ON public.clips
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clips"
  ON public.clips
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clips"
  ON public.clips
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view logs"
  ON public.admin_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Storage policies for clips bucket
CREATE POLICY "Anyone can upload clips to storage"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'clips');

CREATE POLICY "Anyone can view clips from storage"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'clips');

CREATE POLICY "Admins can delete clips from storage"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'clips' AND has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_clips_status ON public.clips(status);
CREATE INDEX idx_clips_category ON public.clips(category);
CREATE INDEX idx_clips_created_at ON public.clips(created_at DESC);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_user_id ON public.admin_logs(user_id);
CREATE INDEX idx_admin_logs_table_name ON public.admin_logs(table_name);