-- データベーススキーマに新しいフィールドを追加
\`\`\`sql
-- 消費日数と在庫数のカラムを追加
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS consumption_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 1;
\`\`\`
