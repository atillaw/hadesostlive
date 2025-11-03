-- Create sponsors table
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active sponsors"
  ON public.sponsors
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sponsors"
  ON public.sponsors
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sponsors"
  ON public.sponsors
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sponsors"
  ON public.sponsors
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Storage policies for sponsor logos
CREATE POLICY "Anyone can view sponsor logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Admins can upload sponsor logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'sponsor-logos' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update sponsor logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'sponsor-logos' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete sponsor logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'sponsor-logos' 
    AND has_role(auth.uid(), 'admin')
  );

-- Trigger for updated_at
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();