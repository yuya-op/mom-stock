export function getCategoryImage(category: string, imageUrl?: string | null): string {
  // 画像URLが指定されている場合はそれを使用（空文字列や undefined でない場合）
  if (imageUrl && imageUrl.trim() !== "" && !imageUrl.includes("placeholder.svg")) {
    // 外部URLの場合はプロキシを使用
    if (imageUrl.startsWith("http") && !imageUrl.startsWith(window.location.origin)) {
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    }
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
      return "/category-other.png"
    default:
      return "/category-other.png"
  }
}
