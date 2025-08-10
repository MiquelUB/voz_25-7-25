CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for authenticated users only"
ON drafts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own drafts"
ON drafts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own drafts"
ON drafts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own drafts"
ON drafts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
