-- =============================================
-- 不動産管理アプリ: propertiesテーブル定義
-- Supabaseのダッシュボード > SQL Editor で実行してください
-- =============================================

-- 物件テーブルを作成
CREATE TABLE IF NOT EXISTS properties (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,          -- 物件名
  rent        INTEGER     NOT NULL CHECK (rent > 0),  -- 家賃（円）
  area        TEXT        NOT NULL,          -- エリア名
  layout      TEXT        NOT NULL,          -- 間取り（例：1LDK）
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Row Level Security（RLS）の設定
-- =============================================

-- RLSを有効化（デフォルトは全行アクセス不可になる）
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分が登録した物件のみ取得可能
CREATE POLICY "自分の物件のみ表示"
  ON properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: user_idが自分のUIDと一致する場合のみ登録可能
CREATE POLICY "自分の物件のみ登録"
  ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分が登録した物件のみ更新可能
CREATE POLICY "自分の物件のみ更新"
  ON properties
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 自分が登録した物件のみ削除可能
CREATE POLICY "自分の物件のみ削除"
  ON properties
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- インデックス（パフォーマンス向上）
-- =============================================

-- user_idで絞り込む頻度が高いためインデックスを作成
CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);
