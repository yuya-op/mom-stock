-- バーコード情報を保存するテーブル
CREATE TABLE IF NOT EXISTS product_barcodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode TEXT NOT NULL UNIQUE,
  product_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_product_barcodes_barcode ON product_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_product_barcodes_product_id ON product_barcodes(product_id);

-- RLSポリシーを設定
ALTER TABLE product_barcodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "バーコード情報は認証ユーザーが参照可能" 
  ON product_barcodes FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "バーコード情報は認証ユーザーが追加可能" 
  ON product_barcodes FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "バーコード情報は認証ユーザーが更新可能" 
  ON product_barcodes FOR UPDATE 
  USING (auth.role() = 'authenticated');
