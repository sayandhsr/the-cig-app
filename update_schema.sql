-- 1. Auto-Delete Messages (pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-old-messages',
  '0 0 * * *', -- Run daily at midnight
  
    DELETE FROM public.global_messages WHERE created_at < NOW() - INTERVAL '14 days';
    DELETE FROM public.spot_messages WHERE created_at < NOW() - INTERVAL '14 days';
  
);

-- 2. Enhanced User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON "public"."user_profiles" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."user_profiles" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all" ON "public"."user_profiles" FOR UPDATE TO public USING (true);

