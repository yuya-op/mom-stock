"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ShoppingCart, ShoppingBag, AlertTriangle } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"
import { PurchaseResultDialog } from "@/components/purchase-result-dialog"

export function ItemDetailDialog({ open, onClose, item, updateAmount, addToShoppingList }) {
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showPurchaseResultDialog, setShowPurchaseResultDialog] = useState(false)
  const [purchaseStore, setPurchaseStore] = useState(null)
  const [lastPurchasedItem, setLastPurchasedItem] = useState(null)

  // アイテムが変更されたときに現在のパーセンテージを更新
  useEffect(() => {
    if (item) {
      const percentage = (item.currentAmount / item.totalAmount) * 100
      setCurrentPercentage(percentage)
    }
  }, [item])

  // 外部サイトから戻ってきたときの処理のためのURLパラメータチェック
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const fromStore = urlParams.get("from_store")
      const itemId = urlParams.get("item_id")

      if (fromStore && itemId && item && item.id.toString() === itemId) {
        setPurchaseStore(fromStore)
        setLastPurchasedItem(item)
        setShowPurchaseResultDialog(true)

        // URLパラメータをクリア
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [item])

  if (!item) return null

  const isLowStock = currentPercentage < 30

  const handleSliderChange = (value) => {
    const newPercentage = value[0]
    setCurrentPercentage(newPercentage)
    const newAmount = (newPercentage / 100) * item.totalAmount
    updateAmount(item.id, newAmount)
  }

  const handleAddToShoppingList = () => {
    addToShoppingList(item)
    onClose()
  }

  const handlePurchaseClick = () => {
    setShowPurchaseDialog(true)
  }

  const handlePurchaseConfirm = (confirmed) => {
    if (confirmed) {
      // 購入済みとしてマークされた場合、アイテムを満タンにする
      updateAmount(item.id, item.totalAmount)
      setCurrentPercentage(100)
    }
    setShowPurchaseDialog(false)
  }

  const handleExternalPurchase = (store, item) => {
    // 外部サイトに飛ぶ前に、戻ってきたときのためのURLを設定
    let purchaseUrl = ""

    if (store === "amazon") {
      // Amazonの検索URLを生成（実際のアプリではより適切なURLを使用）
      purchaseUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(item.name)}`
    } else if (store === "rakuten") {
      // 楽天の検索URLを生成
      purchaseUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(item.name)}`
    }

    // 現在のURLを保存して、戻ってきたときに状態を復元できるようにする
    const returnUrl = `${window.location.origin}${window.location.pathname}?from_store=${store}&item_id=${item.id}`

    // 新しいタブで外部サイトを開く
    window.open(purchaseUrl, "_blank")

    // 購入ダイアログを閉じる
    setShowPurchaseDialog(false)

    // 購入結果確認ダイアログを表示
    setPurchaseStore(store)
    setLastPurchasedItem(item)
    setShowPurchaseResultDialog(true)
  }

  const handlePurchaseResult = (purchased) => {
    if (purchased && lastPurchasedItem) {
      // 「はい」を選んだ場合、在庫を満タンにする
      updateAmount(lastPurchasedItem.id, lastPurchasedItem.totalAmount)
      setCurrentPercentage(100)
    }
    // 購入結果ダイアログを閉じる
    setShowPurchaseResultDialog(false)
  }

  // 残量に応じたプログレスバーの色を取得する関数
  const getProgressColor = (percentage) => {
    if (percentage <= 20) {
      return "!bg-red-500 rounded-full" // 20%以下: 赤
    } else if (percentage <= 40) {
      return "!bg-orange-500 rounded-full" // 40%以下: オレンジ
    } else if (percentage <= 60) {
      return "!bg-yellow-500 rounded-full" // 60%以下: 黄色
    } else {
      return "!bg-green-500 rounded-full" // それ以上: 緑
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between pb-2">
            <DialogTitle className="text-gray-800">{item.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span>残量</span>
                  <span className="flex items-center">
                    {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />}
                    {Math.round(currentPercentage)}%
                  </span>
                </div>
                <Progress
                  value={currentPercentage}
                  className="h-2 rounded-full bg-gray-100"
                  indicatorClassName={getProgressColor(currentPercentage)}
                />
              </div>
            </div>

            {isAdjusting ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>残量を調整</span>
                    <span>{Math.round(currentPercentage)}%</span>
                  </div>
                  <Slider
                    value={[currentPercentage]}
                    max={100}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="[&_[role=slider]]:bg-pink-400 [&_[role=slider]]:border-pink-200"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsAdjusting(false)}
                  className="w-full rounded-full border-gray-200 text-gray-700"
                >
                  完了
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdjusting(true)}
                  className="w-full rounded-full border-gray-200 text-gray-700 h-12"
                >
                  残量を調整
                </Button>
                <Button
                  onClick={handlePurchaseClick}
                  className="w-full bg-pink-400 hover:bg-pink-500 rounded-full h-12"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  購入
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToShoppingList}
                  className="w-full rounded-full border-gray-200 text-gray-700 h-12"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  買い物リストに追加
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PurchaseConfirmDialog
        open={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onConfirm={handlePurchaseConfirm}
        onExternalPurchase={handleExternalPurchase}
        item={item}
      />

      <PurchaseResultDialog
        open={showPurchaseResultDialog}
        onClose={() => setShowPurchaseResultDialog(false)}
        onResult={handlePurchaseResult}
        item={lastPurchasedItem}
        store={purchaseStore}
      />
    </>
  )
}
