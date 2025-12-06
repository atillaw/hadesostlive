-- Create minecraft profiles table (separate from main profiles)
CREATE TABLE public.minecraft_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  minecraft_username text,
  minecraft_uuid text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create VIP requests table
CREATE TABLE public.vip_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_name text NOT NULL CHECK (package_name IN ('VIP', 'VIP+', 'MVIP')),
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create contact messages table
CREATE TABLE public.minecraft_contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create announcements table
CREATE TABLE public.minecraft_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.minecraft_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minecraft_contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minecraft_announcements ENABLE ROW LEVEL SECURITY;

-- Minecraft profiles policies
CREATE POLICY "Users can view own minecraft profile" ON public.minecraft_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own minecraft profile" ON public.minecraft_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own minecraft profile" ON public.minecraft_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all minecraft profiles" ON public.minecraft_profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- VIP requests policies
CREATE POLICY "Users can view own vip requests" ON public.vip_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create vip requests" ON public.vip_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all vip requests" ON public.vip_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vip requests" ON public.vip_requests
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Contact messages policies
CREATE POLICY "Anyone can create contact messages" ON public.minecraft_contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact messages" ON public.minecraft_contact_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages" ON public.minecraft_contact_messages
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Announcements policies
CREATE POLICY "Anyone can view announcements" ON public.minecraft_announcements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage announcements" ON public.minecraft_announcements
  FOR ALL USING (has_role(auth.uid(), 'admin'));