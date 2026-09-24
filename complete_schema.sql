-- ============================================================================
-- FULL DATABASE RESET & SETUP SCRIPT
-- WARNING: This will drop existing tables and data before recreating them!
-- ============================================================================

-- 1. CLEANUP OLD TABLES & PUBLICATIONS
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.discovery_profiles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.debate_comments CASCADE;
DROP TABLE IF EXISTS public.debates CASCADE;
DROP TABLE IF EXISTS public.spot_messages CASCADE;
DROP TABLE IF EXISTS public.global_messages CASCADE;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Global Chat
CREATE TABLE public.global_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL
);

-- Spot Chat
CREATE TABLE public.spot_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

-- Debates
CREATE TABLE public.debates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'debate' or 'poll'
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    votes JSONB DEFAULT '{}'::jsonb
);

-- Debate Comments
CREATE TABLE public.debate_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    text TEXT NOT NULL
);

-- Discovery Profiles (For the Radar feature)
CREATE TABLE public.discovery_profiles (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    brand TEXT DEFAULT '',
    status TEXT DEFAULT 'Open to chat',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Profiles (For the Dossier / Network feature)
CREATE TABLE public.user_profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    gender TEXT,
    age INTEGER,
    bio TEXT,
    priority TEXT,
    finding TEXT,
    interest TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Connections (Friend Requests)
CREATE TABLE public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- Direct Messages (1-on-1 Inbox Chat)
CREATE TABLE public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

ALTER TABLE public.global_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."global_messages" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."global_messages" FOR INSERT TO public WITH CHECK (true);

ALTER TABLE public.spot_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."spot_messages" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."spot_messages" FOR INSERT TO public WITH CHECK (true);

ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."debates" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."debates" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all" ON "public"."debates" FOR UPDATE TO public USING (true);

ALTER TABLE public.debate_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."debate_comments" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."debate_comments" FOR INSERT TO public WITH CHECK (true);

ALTER TABLE public.discovery_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."discovery_profiles" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."discovery_profiles" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all" ON "public"."discovery_profiles" FOR UPDATE TO public USING (true);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."user_profiles" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."user_profiles" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all" ON "public"."user_profiles" FOR UPDATE TO public USING (true);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."connections" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."connections" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all" ON "public"."connections" FOR UPDATE TO public USING (true);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."direct_messages" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."direct_messages" FOR INSERT TO public WITH CHECK (true);

-- ============================================================================
-- 4. ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.global_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spot_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discovery_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- ============================================================================
-- 5. AUTOMATIC 14-DAY MESSAGE DELETION (PG_CRON)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-old-messages',
  '0 0 * * *', -- Runs every day at midnight (00:00)
  
    DELETE FROM public.global_messages WHERE created_at < NOW() - INTERVAL '14 days';
    DELETE FROM public.spot_messages WHERE created_at < NOW() - INTERVAL '14 days';
  
);
