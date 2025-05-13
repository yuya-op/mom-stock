-- プッシュ通知トークンを保存するテーブル
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  device_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユニーク制約を追加（ユーザーごとに最新のトークンのみを保持）
CREATE UNIQUE INDEX IF NOT EXISTS user_push_tokens_user_id_idx ON user_push_tokens (user_id);

-- RLSポリシーを設定
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のトークンのみ挿入可能
CREATE POLICY "Users can insert their own push tokens"
  ON user_push_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザー自身のトークンのみ更新可能
CREATE POLICY "Users can update their own push tokens"
  ON user_push_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ユーザー自身のトークンのみ閲覧可能
CREATE POLICY "Users can view their own push tokens"
  ON user_push_tokens
  FOR SELECT
  USING (auth.uid() = user_id);
