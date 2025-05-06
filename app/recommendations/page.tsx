"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ShoppingBag, ThumbsUp, Star, Plus } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"
import { PurchaseResultDialog } from "@/components/purchase-result-dialog"

// 最初にファイルの先頭でインポートを追加
import { getCategoryImage } from "@/utils/get-category-image"

export default function Recommendations() {
  // カテゴリー
  const categories = ["すべて", "おむつ", "ケア用品", "食料品", "その他"]
  const [activeCategory, setActiveCategory] = useState("すべて")

  // 購入関連の状態
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showPurchaseResultDialog, setShowPurchaseResultDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [purchaseStore, setPurchaseStore] = useState(null)

  // 買い物リストの状態（実際のアプリではグローバルステートから取得）
  const [shoppingList, setShoppingList] = useState([])

  // おすすめ商品のサンプルデータ
  const recommendations = [
    {
      id: 101,
      name: "メリーズ おむつ テープ Sサイズ",
      category: "おむつ",
      rating: 4.8,
      imageUrl: "/assorted-baby-diapers.png",
      description: "赤ちゃんの肌にやさしい、通気性の良いおむつです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 102,
      name: "ムーニー おむつ パンツ Mサイズ",
      category: "おむつ",
      rating: 4.7,
      imageUrl: "/assorted-baby-diapers.png",
      description: "動き回る赤ちゃんにぴったりのパンツタイプおむつです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 103,
      name: "パンパース おしりふき",
      category: "おむつ",
      rating: 4.6,
      imageUrl: "/gentle-care.png",
      description: "デリケートな赤ちゃんのお肌に優しいおしりふきです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 104,
      name: "キューピー ベビーフード 7ヶ月から",
      category: "食料品",
      rating: 4.5,
      imageUrl: "/single-baby-food-jar.png",
      description: "栄養バランスの取れた離乳食です。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 105,
      name: "和光堂 ベビーフード 9ヶ月から",
      category: "食料品",
      rating: 4.4,
      imageUrl: "/assortment-baby-food.png",
      description: "歯ぐきで噛める固さの離乳食です。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 106,
      name: "明治 ほほえみ 粉ミルク",
      category: "食料品",
      rating: 4.9,
      imageUrl: "/infant-feeding-essentials.png",
      description: "赤ちゃんの成長をサポートする栄養たっぷりの粉ミルクです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 107,
      name: "ピジョン ベビーソープ",
      category: "ケア用品",
      rating: 4.7,
      imageUrl: "/gentle-baby-wash.png",
      description: "赤ちゃんの敏感な肌のために開発された低刺激性ソープです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 108,
      name: "ジョンソン ベビーローション",
      category: "ケア用品",
      rating: 4.6,
      imageUrl: "/gentle-care.png",
      description: "赤ちゃんの肌を保湿し、乾燥から守ります。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 109,
      name: "ピジョン 綿棒",
      category: "ケア用品",
      rating: 4.5,
      imageUrl: "/pile-of-cotton-swabs.png",
      description: "赤ちゃんのデリケートな部分のケアに最適な綿棒です。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 110,
      name: "アカチャンホンポ ベビー布団セット",
      category: "その他",
      rating: 4.6,
      imageUrl: "/cozy-crib.png",
      description: "洗濯機で洗える、赤ちゃんに優しい布団セットです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 111,
      name: "コンビ ベビーカー",
      category: "その他",
      rating: 4.8,
      imageUrl: "/cozy-crib.png",
      description: "軽量で折りたたみやすい、使い勝手の良いベビーカーです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 112,
      name: "トイレットペーパー 12ロール",
      category: "その他",
      rating: 4.3,
      imageUrl: "/toilet-paper.png",
      description: "ふんわりやわらかな肌触りのトイレットペーパーです。",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
  ]

  // カテゴリでフィルタリング
  const filteredRecommendations =
    activeCategory === "すべて" ? recommendations : recommendations.filter((item) => item.category === activeCategory)

  // 購入ボタンがクリックされたときの処理
  const handlePurchaseClick = (item) => {
    setSelectedItem(item)
    setShowPurchaseDialog(true)
  }

  // 購入確認ダイアログでの選択
  const handlePurchaseConfirm = (confirmed) => {
    setShowPurchaseDialog(false)
  }

  // 外部サイトでの購入
  const handleExternalPurchase = (store, item) => {
    // 外部サイトに飛ぶ前に、戻ってきたときのためのURLを設定
    let purchaseUrl = ""

    if (store === "amazon") {
      // Amazonの検索URLを生成
      purchaseUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(item.name)}`
    } else if (store === "rakuten") {
      // 楽天の検索URLを生成
      purchaseUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(item.name)}`
    }

    // 新しいタブで外部サイトを開く
    window.open(purchaseUrl, "_blank")

    // 購入ダイアログを閉じる
    setShowPurchaseDialog(false)

    // 購入結果確認ダイアログを表示
    setPurchaseStore(store)
    setShowPurchaseResultDialog(true)
  }

  // 購入結果の確認
  const handlePurchaseResult = (purchased) => {
    // 購入結果ダイアログを閉じる
    setShowPurchaseResultDialog(false)

    // 実際のアプリでは、ここで在庫管理システムに商品を追加するなどの処理を行う
    if (purchased) {
      console.log(`${selectedItem.name}を購入しました。在庫に追加します。`)
      // 在庫追加のロジックをここに実装
    }
  }

  // 商品を在庫に追加
  const handleAddToInventory = (item) => {
    console.log(`${item.name}を在庫に追加します`)
    // 実際のアプリでは、ここで在庫管理システムに商品を追加する処理を行う
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 lg:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2">
              <Image src="/app-icon.png" alt="mom-stockアイコン" width={32} height={32} className="rounded-md" />
            </div>
            <span className="text-xl font-bold text-gray-800">mom-stock</span>
          </div>
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-pink-50 p-2 rounded-full">
            <ThumbsUp className="h-5 w-5 text-pink-400" />
          </div>
          <h1 className="text-lg font-semibold md:text-xl text-gray-800">おすすめ商品</h1>
        </div>

        {/* カテゴリ選択 */}
        <div className="overflow-auto">
          <div className="flex space-x-2 pb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={`rounded-full text-xs px-3 py-1 h-auto ${
                  activeCategory === category
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 商品リスト */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full"
              >
                <div className="relative h-28 sm:h-36 w-full">
                  <Image
                    src={getCategoryImage(item.category, item.imageUrl) || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center bg-white bg-opacity-90 rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="ml-1 text-xs font-medium">{item.rating}</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                  <div className="mb-1">
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <h3 className="font-medium text-sm sm:text-base text-gray-800 line-clamp-1">{item.name}</h3>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{item.description}</p>
                  <div className="flex space-x-1 mt-auto">
                    <Button
                      className="flex-1 bg-pink-400 hover:bg-pink-500 rounded-full text-xs h-8"
                      onClick={() => handlePurchaseClick(item)}
                    >
                      購入する
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-gray-200 h-8 w-8"
                      onClick={() => handleAddToInventory(item)}
                    >
                      <Plus className="h-3 w-3 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">該当する商品がありません</div>
          )}
        </div>
      </main>
      <div className="sticky bottom-0 border-t bg-white p-2">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">ホーム</span>
            </Button>
          </Link>
          <Link href="/shopping-list">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800 relative"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {shoppingList.length > 0 && (
                  <span className="absolute -top-1 right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {shoppingList.length}
                  </span>
                )}
              </div>
              <span className="text-xs">買い物リスト</span>
            </Button>
          </Link>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-pink-500">
            <ThumbsUp className="h-5 w-5" />
            <span className="text-xs">おすすめ</span>
          </Button>
        </div>
      </div>

      {/* 購入確認ダイアログ */}
      <PurchaseConfirmDialog
        open={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onConfirm={handlePurchaseConfirm}
        onExternalPurchase={handleExternalPurchase}
        item={selectedItem}
      />

      {/* 購入結果確認ダイアログ */}
      <PurchaseResultDialog
        open={showPurchaseResultDialog}
        onClose={() => setShowPurchaseResultDialog(false)}
        onResult={handlePurchaseResult}
        item={selectedItem}
        store={purchaseStore}
      />
    </div>
  )
}
