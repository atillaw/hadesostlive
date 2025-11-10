-- Update site_settings to support multiple holiday banners
-- Keep the existing ataturk_memorial_visible setting

-- Insert holiday banner settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('holiday_23_nisan_visible', 'false'::jsonb, '23 Nisan - Ulusal Egemenlik ve Çocuk Bayramı banner görünürlüğü'),
  ('holiday_1_mayis_visible', 'false'::jsonb, '1 Mayıs - Emek ve Dayanışma Günü banner görünürlüğü'),
  ('holiday_19_mayis_visible', 'false'::jsonb, '19 Mayıs - Atatürk''ü Anma, Gençlik ve Spor Bayramı banner görünürlüğü'),
  ('holiday_15_temmuz_visible', 'false'::jsonb, '15 Temmuz - Demokrasi ve Milli Birlik Günü banner görünürlüğü'),
  ('holiday_30_agustos_visible', 'false'::jsonb, '30 Ağustos - Zafer Bayramı banner görünürlüğü'),
  ('holiday_29_ekim_visible', 'false'::jsonb, '29 Ekim - Cumhuriyet Bayramı banner görünürlüğü'),
  ('holiday_ramazan_visible', 'false'::jsonb, 'Ramazan Bayramı banner görünürlüğü'),
  ('holiday_kurban_visible', 'false'::jsonb, 'Kurban Bayramı banner görünürlüğü')
ON CONFLICT (key) DO NOTHING;