-- items テーブルの作成
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  "currentAmount" DECIMAL NOT NULL DEFAULT 1,
  "totalAmount" DECIMAL NOT NULL DEFAULT 1,
  "decrease_rate" DECIMAL NOT NULL DEFAULT 0.1,
  "daysToEmpty" INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN "decrease_rate" > 0 THEN ROUND("currentAmount" / "decrease_rate") 
      ELSE 0
    END
  ) STORED,
  "imageUrl" TEXT,
  "purchaseUrl" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のアイテムのみ参照可能
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のアイテムのみ追加可能
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のアイテムのみ更新可能
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のアイテムのみ削除可能
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 更新時に updated_at を自動更新する関数とトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
