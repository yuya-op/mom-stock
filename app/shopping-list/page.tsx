"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ShoppingBag, ThumbsUp, Trash2 } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"

export default function ShoppingList() {
  // 実際のアプリではグローバルステートやAPIから取得する
  const [shoppingList, setShoppingList] = useState([
    {
      id: 2,
      name: "ムーニー おしりふき",
      category: "おむつ",
      imageUrl: "/gentle-care.png",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
    {
      id: 5,
      name: "和光堂 ベビーフード",
      category: "食料品",
      imageUrl: "/assortment-baby-food.png",
      purchaseUrl: "https://www.amazon.co.jp/",
    },
  ])

  const [selectedItem, setSelectedItem] = useState(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  const removeFromList = (id) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id))
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowPurchaseDialog(true)
  }

  const handlePurchaseConfirm = (confirmed) => {
    if (confirmed) {
      // 購入済みとしてマークされた場合、リストから削除
      removeFromList(selectedItem.id)
    }
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

        {shoppingList.length > 0 ? (
          <div className="grid gap-3">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg mr-3">
                  <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-red-200 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation() // イベントの伝播を停止
                      removeFromList(item.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 flex justify-end">
              <Button className="bg-pink-400 hover:bg-pink-500 rounded-full">すべて購入する</Button>
            </div>
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
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-pink-500">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs">買い物リスト</span>
          </Button>
          <Link href="/recommendations">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <ThumbsUp className="h-5 w-5" />
              <span className="text-xs">おすすめ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 購入確認ダイアログ */}
      <PurchaseConfirmDialog
        open={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onConfirm={handlePurchaseConfirm}
        item={selectedItem}
      />
    </div>
  )
}
