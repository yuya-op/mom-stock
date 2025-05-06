"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ShoppingBag, BarChart2, Trash2, Check, Loader2 } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"
import { PriceInputDialog } from "@/components/price-input-dialog"
import { getCategoryImage } from "@/utils/get-category-image"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { useToast } from "@/hooks/use-toast"

export default function ShoppingList() {
  const { shoppingList, isLoading, error, removeFromShoppingList, purchaseItem } = useShoppingList()
  const { toast } = useToast()

  const [selectedItem, setSelectedItem] = useState(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [itemForPriceInput, setItemForPriceInput] = useState(null)

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowPurchaseDialog(true)
  }

  const handlePurchaseConfirm = async (confirmed) => {
    if (confirmed && selectedItem) {
      // 価格入力ダイアログを表示
      setItemForPriceInput(selectedItem)
      setShowPriceDialog(true)
      setShowPurchaseDialog(false)
    } else {
      setShowPurchaseDialog(false)
    }
  }

  const handlePriceConfirm = async (price: number) => {
    if (itemForPriceInput) {
      setIsPurchasing(true)
      try {
        // 購入済みとしてマーク（価格情報付き）
        const success = await purchaseItem(
          itemForPriceInput.id,
          itemForPriceInput.item_id,
          itemForPriceInput.totalAmount,
          price,
        )
        if (success) {
          toast({
            title: "購入完了",
            description: "在庫を補充し、購入履歴に記録しました",
          })
        }
      } catch (err) {
        console.error("Error purchasing item:", err)
        toast({
          title: "エラー",
          description: "購入処理に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsPurchasing(false)
        setShowPriceDialog(false)
        setItemForPriceInput(null)
      }
    } else {
      setShowPriceDialog(false)
    }
  }

  const handleRemoveFromList = async (e, id) => {
    e.stopPropagation() // イベントの伝播を停止
    await removeFromShoppingList(id)
  }

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
            <ShoppingBag className="h-5 w-5 text-pink-400" />
          </div>
          <h1 className="text-lg font-semibold md:text-xl text-gray-800">買い物リスト</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400 mb-4" />
            <p className="text-gray-500">データを読み込み中...</p>
          </div>
        ) : shoppingList.length > 0 ? (
          <div className="grid gap-3">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg mr-3 bg-gray-100">
                  <Image
                    src={getCategoryImage(item.category, item.imageUrl) || "/placeholder.svg"}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-green-200 h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation() // イベントの伝播を停止
                      handlePurchaseConfirm(true)
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-red-200 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleRemoveFromList(e, item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ShoppingBag className="h-12 w-12 mb-4 text-gray-300" />
            <p>買い物リストは空です</p>
            <Link href="/dashboard" className="mt-4">
              <Button variant="outline">ホームに戻る</Button>
            </Link>
          </div>
        )}
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
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-pink-500 relative">
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {shoppingList.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {shoppingList.length}
                </span>
              )}
            </div>
            <span className="text-xs">買い物リスト</span>
          </Button>
          <Link href="/history">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs">履歴 / 分析</span>
            </Button>
          </Link>
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

      {/* 価格入力ダイアログ */}
      <PriceInputDialog
        open={showPriceDialog}
        onClose={() => setShowPriceDialog(false)}
        onConfirm={handlePriceConfirm}
        itemName={itemForPriceInput?.name || ""}
      />
    </div>
  )
}
