-- Drop existing table if it exists
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Create site_settings table with JSONB value column for flexible data storage
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Anyone can read site settings"
ON public.site_settings
FOR SELECT
TO public
USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to insert settings
CREATE POLICY "Authenticated users can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert the ataturk memorial setting
INSERT INTO public.site_settings (key, value, description)
VALUES ('ataturk_memorial_visible', 'true'::jsonb, 'Show Ataturk memorial banner on homepage');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER update_site_settings_timestamp
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_timestamp();