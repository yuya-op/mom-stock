-- Add new columns for days-based management
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS days_remaining INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

-- Convert existing data: days = ceil(qty / decay_rate)
UPDATE items SET days_remaining = CEIL(qty / NULLIF(decay_rate, 0))
WHERE qty IS NOT NULL AND decay_rate IS NOT NULL;

-- Create function to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION set_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function before each update
DROP TRIGGER IF EXISTS trg_set_last_updated ON items;
CREATE TRIGGER trg_set_last_updated
BEFORE UPDATE ON items
FOR EACH ROW EXECUTE PROCEDURE set_last_updated();
