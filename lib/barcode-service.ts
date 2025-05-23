// バーコードから商品情報を取得する関数
export async function getProductByBarcode(barcode: string) {
  try {
    // サーバーサイドAPIを呼び出す
    const response = await fetch(`/api/barcode/${barcode}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return data.product
  } catch (err) {
    console.error("Error in getProductByBarcode:", err)
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

// 外部APIから商品情報を取得する関数
async function fetchFromExternalAPI(barcode: string) {
  try {
    // 注: 実際の実装では、有効なバーコードAPIサービスのエンドポイントに置き換えてください
    // 例: Open Food Facts API, UPC Database API など
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)

    if (!response.ok) {
      throw new Error("Product not found in external API")
    }

    const data = await response.json()

    // APIからのレスポンスを整形
    if (data && data.status === 1 && data.product) {
      return {
        name: data.product.product_name || `商品 (${barcode})`,
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
  const lowerTags = tags.map((tag) => tag.toLowerCase())

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
