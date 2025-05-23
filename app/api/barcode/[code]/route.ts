import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { code: string } }) {
  const barcode = params.code

  if (!barcode) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 })
  }

  try {
    // まずSupabaseのデータベースから検索
    const { data, error } = await supabase
      .from("product_barcodes")
      .select(`
        id,
        barcode,
        product_id,
        items:product_id (
          id,
          name,
          category,
          imageUrl,
          days_remaining,
          consumption_days
        )
      `)
      .eq("barcode", barcode)
      .single()

    if (!error && data && data.items) {
      // データベースに商品情報がある場合
      return NextResponse.json({
        source: "database",
        product: {
          id: data.items.id,
          name: data.items.name,
          category: data.items.category,
          imageUrl: data.items.imageUrl,
          consumption_days: data.items.consumption_days || 30,
          barcode: barcode,
        },
      })
    }

    // データベースに情報がない場合は外部APIを呼び出す
    const productInfo = await fetchFromExternalAPI(barcode)

    return NextResponse.json({
      source: "external",
      product: productInfo,
    })
  } catch (error) {
    console.error("Error in barcode API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch product information",
        product: {
          name: `商品 (${barcode})`,
          category: "その他",
          imageUrl: null,
          consumption_days: 30,
          barcode: barcode,
        },
      },
      { status: 500 },
    )
  }
}

// 外部APIから商品情報を取得する関数
async function fetchFromExternalAPI(barcode: string) {
  try {
    // Open Food Facts APIを使用
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)

    if (!response.ok) {
      throw new Error("Product not found in external API")
    }

    const data = await response.json()

    // APIからのレスポンスを整形
    if (data && data.status === 1 && data.product) {
      return {
        name: data.product.product_name_ja || data.product.product_name || `商品 (${barcode})`,
        category: getCategoryFromTags(data.product.categories_tags) || "その他",
        imageUrl: data.product.image_url,
        consumption_days: 30, // デフォルト値
        barcode: barcode,
      }
    }

    // 情報が見つからない場合はバーコードのみの基本情報を返す
    return {
      name: `商品 (${barcode})`,
      category: "その他",
      imageUrl: null,
      consumption_days: 30,
      barcode: barcode,
    }
  } catch (err) {
    console.error("Error fetching from external API:", err)
    // エラー時は基本情報を返す
    return {
      name: `商品 (${barcode})`,
      category: "その他",
      imageUrl: null,
      consumption_days: 30,
      barcode: barcode,
    }
  }
}

// カテゴリタグから適切なカテゴリを判定する関数
function getCategoryFromTags(tags: string[] = []) {
  const lowerTags = tags?.map((tag) => tag.toLowerCase()) || []

  // 日本語カテゴリへのマッピング
  if (lowerTags.some((tag) => tag.includes("diaper") || tag.includes("nappy"))) {
    return "おむつ"
  }
  if (lowerTags.some((tag) => tag.includes("baby") && (tag.includes("food") || tag.includes("formula")))) {
    return "食料品"
  }
  if (lowerTags.some((tag) => tag.includes("wipe") || tag.includes("lotion") || tag.includes("cream"))) {
    return "ケア用品"
  }

  return "その他"
}
