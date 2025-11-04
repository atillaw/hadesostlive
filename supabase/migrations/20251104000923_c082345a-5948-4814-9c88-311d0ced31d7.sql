-- Fix vod_stats view to use security invoker instead of security definer
-- This ensures the view runs with the permissions of the user querying it, not the owner
ALTER VIEW public.vod_stats SET (security_invoker = true);