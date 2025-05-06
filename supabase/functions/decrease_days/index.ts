import { createClient } from "@supabase/supabase-js"

// Environment variables set in Supabase Dashboard
const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    // 全アイテムを取得
    const { data: items, error: fetchError } = await supabase
      .from("items")
      .select("id, currentAmount, totalAmount, decrease_rate")

    if (fetchError) throw fetchError

    // 更新処理の結果を格納する配列
    const results = []

    // 各アイテムを処理
    for (const item of items || []) {
      // 現在の残量から減少率を引く（1日分の減少）
      let newCurrentAmount = Math.max(0, (item.currentAmount || 0) - (item.decrease_rate || 0))

      // 0未満にならないように制限
      if (newCurrentAmount < 0) newCurrentAmount = 0

      // アイテムを更新
      const { data, error: updateError } = await supabase
        .from("items")
        .update({ currentAmount: newCurrentAmount })
        .eq("id", item.id)
        .select()

      results.push({
        id: item.id,
        success: !updateError,
        error: updateError ? updateError.message : null,
        oldAmount: item.currentAmount,
        newAmount: newCurrentAmount,
      })

      if (updateError) console.error(`Error updating item ${item.id}:`, updateError)
    }

    return new Response(
      JSON.stringify({
        message: "Daily decrease process completed",
        processed: items?.length || 0,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error in decrease_days function:", error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})

/*
デプロイ手順:
1. Supabase CLI をインストール: npm install -g supabase
2. ログイン: supabase login
3. 関数をデプロイ: supabase functions deploy decrease_days --no-verify-jwt
4. Supabase ダッシュボードでスケジュールを設定:
   - スケジュール: 0 0 * * * (毎日午前0時に実行)
   - エンドポイント: https://[YOUR_PROJECT_REF].supabase.co/functions/v1/decrease_days
*/
