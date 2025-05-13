export interface ProductInfo {
  id?: string
  name: string
  category?: string
  image?: string
  description?: string
  barcode: string
}

// モックデータ（実際のAPIに置き換えることができます）
const mockProducts: ProductInfo[] = [
  {
    id: "1",
    name: "パンパース テープ Sサイズ",
    category: "diaper",
    image: "/public/assorted-baby-diapers.png",
    description: "赤ちゃんのお肌にやさしいおむつ",
    barcode: "4902430893800",
  },
  {
    id: "2",
    name: "メリーズ テープ Mサイズ",
    category: "diaper",
    image: "/public/assorted-baby-diapers.png",
    description: "通気性の良いおむつ",
    barcode: "4901301230881",
  },
  {
    id: "3",
    name: "和光堂 ベビーフード 7ヶ月から",
    category: "food",
    image: "/public/single-baby-food-jar.png",
    description: "栄養バランスの良いベビーフード",
    barcode: "4987244171245",
  },
]

export const getProductInfo = async (barcode: string): Promise<ProductInfo | null> => {
  // 実際のAPIを呼び出す場合はここを変更
  // const response = await fetch(`https://api.example.com/products?barcode=${barcode}`);
  // return response.json();

  // モックデータから検索
  const product = mockProducts.find((p) => p.barcode === barcode)

  // 実際のAPIがない場合のフォールバック
  if (!product) {
    // バーコードから仮の商品情報を生成
    return {
      name: `商品 (${barcode})`,
      barcode: barcode,
      category: "other",
    }
  }

  return product
}
