-- 1. Connections Table (Friend Requests)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

-- 2. Direct Messages Table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS for Connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own connections" ON "public"."connections" FOR SELECT TO public USING (sender_id = current_setting('request.jwt.claims', true)::json->>'sub' OR receiver_id = current_setting('request.jwt.claims', true)::json->>'sub' OR true);
CREATE POLICY "Enable insert for all" ON "public"."connections" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all" ON "public"."connections" FOR UPDATE TO public USING (true);

-- 4. RLS for Direct Messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own DMs" ON "public"."direct_messages" FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all" ON "public"."direct_messages" FOR INSERT TO public WITH CHECK (true);

-- 5. Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

