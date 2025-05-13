// 商品情報取得サービス

// 商品情報の型定義
export interface ProductInfo {
  name: string
  category: string
  imageUrl: string | null
  price?: number
}

// サンプル商品データ（実際の実装ではAPIを使用）
const SAMPLE_PRODUCTS: Record<string, ProductInfo> = {
  "4901301348593": {
    // 花王 メリーズ Sサイズ
    name: "メリーズ おむつ Sサイズ (4~8kg) 82枚",
    category: "おむつ",
    imageUrl: "/colorful-diaper-stack.png",
    price: 1980,
  },
  "4902011731842": {
    // パンパース テープ Mサイズ
    name: "パンパース さらさらケア テープ Mサイズ 64枚",
    category: "おむつ",
    imageUrl: "/assorted-baby-diapers.png",
    price: 1780,
  },
  "4987072069875": {
    // 明治 ほほえみ 800g
    name: "明治 ほほえみ 粉ミルク 800g",
    category: "食料品",
    imageUrl: "/infant-feeding-essentials.png",
    price: 1600,
  },
  "4987244183798": {
    // ピジョン 液体ミルク 240ml
    name: "ピジョン 液体ミルク 240ml×6本",
    category: "食料品",
    imageUrl: "/single-baby-food-jar.png",
    price: 1250,
  },
  "4901301278609": {
    // ビオレu ベビーマイルドボディウォッシュ
    name: "ビオレu ベビーマイルドボディウォッシュ 詰替え 380ml",
    category: "ケア用品",
    imageUrl: "/gentle-baby-wash.png",
    price: 480,
  },
}

// バーコードから商品情報を取得する関数
export async function getProductInfo(barcode: string): Promise<ProductInfo | null> {
  try {
    // 実際の実装では外部APIを呼び出す
    // 例: const response = await fetch(`https://api.example.com/products/${barcode}`);

    // モック実装：サンプルデータから商品情報を取得
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 実際のAPI呼び出しを模倣するための遅延

    if (SAMPLE_PRODUCTS[barcode]) {
      return SAMPLE_PRODUCTS[barcode]
    }

    // バーコードに対応する商品が見つからない場合
    return null
  } catch (error) {
    console.error("Failed to fetch product info:", error)
    return null
  }
}
