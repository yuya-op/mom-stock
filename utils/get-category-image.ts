export function getCategoryImage(category: string, imageUrl?: string | null): string {
  // 画像URLが指定されている場合はそれを使用（空文字列や undefined でない場合）
  if (imageUrl && imageUrl.trim() !== "" && !imageUrl.includes("placeholder.svg")) {
    return imageUrl
  }

  // カテゴリに基づいてデフォルト画像を返す
  switch (category?.toLowerCase()) {
    case "おむつ":
      return "/category-diaper.png"
    case "食料品":
      return "/category-food.png"
    case "ケア用品":
      return "/category-care.png"
    case "その他":
      return "/category-other.png" // この行を修正：その他カテゴリーは専用アイコンを使用
    default:
      return "/category-other.png" // デフォルトもその他アイコンに変更
  }
}
