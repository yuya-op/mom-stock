-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  barcode TEXT,
  qty INTEGER NOT NULL DEFAULT 0,
  max_qty INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own items
CREATE POLICY "Users can only access their own items" ON items
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
