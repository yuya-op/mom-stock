import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// 認証キーを確認する関数
const validateApiKey = (request: Request) => {
  const apiKey = request.headers.get("x-api-key")
  // 本番環境では、環境変数などから安全なAPIキーを取得して比較する
  const validApiKey = process.env.API_SECRET_KEY || "your-secret-api-key"
  return apiKey === validApiKey
}

export async function POST(request: Request) {
  try {
    // APIキーの検証
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 全アイテムを取得
    const { data: items, error: fetchError } = await supabase.from("items").select("id, days_remaining")

    if (fetchError) {
      console.error("Error fetching items:", fetchError)
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }

    // 更新結果を格納する配列
    const results = []

    // 各アイテムの残り日数を1日減らす
    for (const item of items || []) {
      // 現在の残り日数から1日減らす（0未満にはならないように）
      const newDaysRemaining = Math.max(0, (item.days_remaining || 0) - 1)

      // アイテムを更新
      const { data, error: updateError } = await supabase
        .from("items")
        .update({ days_remaining: newDaysRemaining })
        .eq("id", item.id)
        .select()

      results.push({
        id: item.id,
        success: !updateError,
        error: updateError ? updateError.message : null,
        oldDays: item.days_remaining,
        newDays: newDaysRemaining,
      })

      if (updateError) {
        console.error(`Error updating item ${item.id}:`, updateError)
      }
    }

    return NextResponse.json({
      message: "Daily decrease process completed",
      processed: items?.length || 0,
      results,
    })
  } catch (error) {
    console.error("Error in decrease-days API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
