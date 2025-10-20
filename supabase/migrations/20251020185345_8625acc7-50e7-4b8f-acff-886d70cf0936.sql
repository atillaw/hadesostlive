-- Create storage bucket for meme images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memes',
  'memes',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create table for meme uploads
CREATE TABLE public.meme_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.meme_uploads ENABLE ROW LEVEL SECURITY;

-- Policies for meme_uploads table
CREATE POLICY "Anyone can upload memes"
ON public.meme_uploads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view approved memes"
ON public.meme_uploads
FOR SELECT
USING (status = 'approved');

CREATE POLICY "Admins can view all memes"
ON public.meme_uploads
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update memes"
ON public.meme_uploads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete memes"
ON public.meme_uploads
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Storage policies for memes bucket
CREATE POLICY "Anyone can upload memes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'memes');

CREATE POLICY "Approved memes are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'memes');

CREATE POLICY "Admins can delete meme files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'memes' AND has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_meme_uploads_status ON public.meme_uploads(status);
CREATE INDEX idx_meme_uploads_created_at ON public.meme_uploads(created_at DESC);