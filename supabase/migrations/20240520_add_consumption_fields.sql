-- 既存のitemsテーブルに消費日数と在庫数のフィールドを追加
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS consumption_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 1;
