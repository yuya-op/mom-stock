"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, ShoppingBag, AlertTriangle, Trash2, Pencil } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"
import { PurchaseResultDialog } from "@/components/purchase-result-dialog"
import { DaysRemainingDialog } from "@/components/days_remaining_dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { getCategoryImage } from "@/utils/get-category-image"
import { getDaysRemaining } from "@/utils/days-remaining"
import { supabase } from "@/lib/supabase"

export function ItemDetailDialog({
  open,
  onClose,
  item,
  updateDaysRemaining,
  updateItemInfo,
  addToShoppingList,
  deleteItem,
}) {
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(30)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showPurchaseResultDialog, setShowPurchaseResultDialog] = useState(false)
  const [showDaysRemainingDialog, setShowDaysRemainingDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [purchaseStore, setPurchaseStore] = useState(null)
  const [lastPurchasedItem, setLastPurchasedItem] = useState(null)
  const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false)
  // 消費日数と在庫数の状態を追加
  const [consumptionDays, setConsumptionDays] = useState(30)
  const [stockCount, setStockCount] = useState(1)

  // アイテムが変更されたときに残り日数を更新
  useEffect(() => {
    if (item) {
      // Handle both old and new schema
      const days = getDaysRemaining(item)
      setDaysRemaining(days)

      // データベースから消費日数と在庫数を取得
      setConsumptionDays(item.consumption_days || 30)
      setStockCount(item.stock_count || 1)
    }
  }, [item])

  // 外部サイトから戻ってきたときの処理のためのURLパラメータチェック
  useEffect(() => {
    if (typeof window !== "undefined" && open && item) {
      const urlParams = new URLSearchParams(window.location.search)
      const fromStore = urlParams.get("from_store")
      const itemId = urlParams.get("item_id")

      if (fromStore && itemId && item.id.toString() === itemId) {
        setPurchaseStore(fromStore)
        setLastPurchasedItem(item)
        setShowPurchaseResultDialog(true)

        // URLパラメータをクリア
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [item, open])

  if (!item) return null

  const itemDaysRemaining = getDaysRemaining(item)
  const isLowDays = itemDaysRemaining <= 5 // 残り5日以下で警告表示

  const handleSliderChange = (value) => {
    const newDays = value[0]
    setDaysRemaining(newDays)
    updateDaysRemaining(item.id, newDays)
  }

  const handleAddToShoppingList = async () => {
    setIsAddingToShoppingList(true)
    try {
      await addToShoppingList(item)
      onClose()
    } finally {
      setIsAddingToShoppingList(false)
    }
  }

  const handlePurchaseClick = () => {
    setShowPurchaseDialog(true)
  }

  const handlePurchaseConfirm = async (confirmed, newDaysRemaining) => {
    if (confirmed) {
      // 購入済みとしてマークされた場合、残り日数を更新
      if (newDaysRemaining !== undefined) {
        // 新しい残り日数が渡された場合はそれを使用
        setDaysRemaining(newDaysRemaining)
        // アイテムオブジェクトも更新
        if (item) {
          item.days_remaining = newDaysRemaining
        }
      } else {
        // 従来の方法（30日にリセット）
        updateDaysRemaining(item.id, 30)
        setDaysRemaining(30)
        if (item) {
          item.days_remaining = 30
        }
      }

      // 購入履歴に追加
      try {
        // 購入履歴に追加するためのAPIを呼び出す
        await fetch("/api/purchase-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id: item.id,
            price: 0, // 価格情報がない場合は0円として記録
            purchased_at: new Date().toISOString(), // 購入ボタンを押した時点の日時
          }),
        })
      } catch (err) {
        console.error("Failed to record purchase history:", err)
      }
    }
    setShowPurchaseDialog(false)
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

  const handlePurchaseResult = (purchased, newDaysRemaining) => {
    // 購入結果ダイアログを閉じる
    setShowPurchaseResultDialog(false)

    // 購入が完了し、新しい残り日数が渡された場合
    if (purchased && newDaysRemaining !== undefined) {
      // 残り日数を更新
      setDaysRemaining(newDaysRemaining)
      // アイテムオブジェクトも更新
      if (item) {
        item.days_remaining = newDaysRemaining
      }
    }
  }

  const handleUpdateDaysRemaining = async (days, consumption, stock) => {
    try {
      // Supabaseに残り日数、消費日数、在庫数を更新
      const { error } = await supabase
        .from("items")
        .update({
          days_remaining: days,
          consumption_days: consumption,
          stock_count: stock,
        })
        .eq("id", item.id)

      if (error) throw error

      // 状態を更新
      updateItemInfo(item.id, days, consumption, stock)
      setDaysRemaining(days)
      setConsumptionDays(consumption)
      setStockCount(stock)

      // アイテムオブジェクトも更新
      if (item) {
        item.days_remaining = days
        item.consumption_days = consumption
        item.stock_count = stock
      }

      setShowDaysRemainingDialog(false)
      return true
    } catch (err) {
      console.error("Failed to update item:", err)
      return false
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await deleteItem(item.id)
      setShowDeleteDialog(false)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  // 残り日数に応じたプログレスバーの色を取得する関数
  const getProgressColor = (days) => {
    if (days <= 3) {
      return "!bg-red-500 rounded-full" // 3日以下: 赤
    } else if (days <= 7) {
      return "!bg-orange-500 rounded-full" // 7日以下: オレンジ
    } else if (days <= 14) {
      return "!bg-yellow-500 rounded-full" // 14日以下: 黄色
    } else {
      return "!bg-green-500 rounded-full" // それ以上: 緑
    }
  }

  // 残り日数のパーセンテージを計算（最大120日を100%とする）
  const daysPercentage = Math.min(100, (Math.min(daysRemaining, 120) / 120) * 100)

  // カテゴリに基づいた画像パスを取得
  const imageSrc = getCategoryImage(item.category, item.imageUrl)

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200 overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-gray-800">{item.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={imageSrc || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span>残り日数</span>
                  <span className="flex items-center">
                    {isLowDays && <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />}
                    {daysRemaining}日
                  </span>
                </div>
                <Progress
                  value={daysPercentage}
                  className="h-2 rounded-full bg-gray-100"
                  indicatorClassName={getProgressColor(daysRemaining)}
                />

                {/* 消費日数と在庫数の情報を追加 */}
                <div className="mt-2 text-sm border-t border-gray-100 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>1個あたりの消費日数:</span>
                    <span>{consumptionDays}日</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>追加個数:</span>
                    <span>{stockCount}個</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">残り日数 = 消費日数 × 追加個数</div>
                </div>
              </div>
            </div>

            {
              <div className="space-y-4">
                {/* サブアクション：2つのボタンを横に並べる */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDaysRemainingDialog(true)}
                    className="rounded-full border-gray-200 text-gray-700 h-10"
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    在庫数調整
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToShoppingList}
                    disabled={isAddingToShoppingList}
                    className="rounded-full border-gray-200 text-gray-700 h-10"
                  >
                    <ShoppingBag className="mr-1 h-4 w-4" />
                    リスト追加
                  </Button>
                </div>

                {/* メインアクション：購入ボタン */}
                <Button
                  onClick={handlePurchaseClick}
                  className="w-full bg-pink-400 hover:bg-pink-500 rounded-full h-12"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  購入
                </Button>

                {/* 危険なアクション：削除ボタン */}
                <div className="pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={handleDeleteClick}
                    className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 h-10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                </div>
              </div>
            }
          </div>
        </DialogContent>
      </Dialog>

      <PurchaseConfirmDialog
        open={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onConfirm={handlePurchaseConfirm}
        onExternalPurchase={handleExternalPurchase}
        item={{ ...item, days_remaining: daysRemaining, consumption_days: consumptionDays, stock_count: stockCount }}
        updateDaysRemaining={updateDaysRemaining}
        setDaysRemaining={setDaysRemaining}
      />

      <PurchaseResultDialog
        open={showPurchaseResultDialog}
        onClose={() => setShowPurchaseResultDialog(false)}
        onResult={handlePurchaseResult}
        item={{ ...item, days_remaining: daysRemaining, consumption_days: consumptionDays, stock_count: stockCount }}
        store={purchaseStore}
        updateDaysRemaining={updateDaysRemaining}
        setDaysRemaining={setDaysRemaining}
      />

      <DaysRemainingDialog
        open={showDaysRemainingDialog}
        onClose={() => setShowDaysRemainingDialog(false)}
        onConfirm={handleUpdateDaysRemaining}
        item={{ ...item, days_remaining: daysRemaining, consumption_days: consumptionDays, stock_count: stockCount }}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        itemName={item.name}
        isDeleting={isDeleting}
      />
    </>
  )
}
