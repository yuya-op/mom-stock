-- items テーブルの構造を変更
ALTER TABLE items 
  DROP COLUMN IF EXISTS "currentAmount",
  DROP COLUMN IF EXISTS "totalAmount",
  DROP COLUMN IF EXISTS "decrease_rate";

-- 残り日数のカラムを追加
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS "daysRemaining" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 更新時に lastUpdated を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastUpdated" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_items_last_updated ON items;
CREATE TRIGGER update_items_last_updated
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();
