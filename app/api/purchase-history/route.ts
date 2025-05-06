import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { item_id, price, purchased_at, quantity = 1 } = await request.json()

    // セッションを取得してユーザーIDを確認
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 購入履歴に追加
    const { error } = await supabase.from("purchase_history").insert({
      user_id: session.user.id,
      item_id,
      qty: quantity, // 購入個数を使用
      price: price || 0,
      purchased_at: purchased_at || new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding purchase history:", error)
      return NextResponse.json({ error: "Failed to add purchase history" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in purchase history API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
