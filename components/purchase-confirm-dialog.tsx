"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ShoppingCart, Check } from "lucide-react"
import { getCategoryImage } from "@/utils/get-category-image"

export function PurchaseConfirmDialog({
  open,
  onClose,
  onConfirm,
  item,
  onExternalPurchase,
  updateDaysRemaining,
  setDaysRemaining,
}) {
  if (!item) return null

  // カテゴリに基づいた画像パスを取得
  const imageSrc = getCategoryImage(item.category, item.imageUrl)

  const handleConfirm = () => {
    // 購入確認時の残り日数リセット部分を修正
    if (updateDaysRemaining && typeof updateDaysRemaining === "function") {
      // ローカルストレージから消費日数を取得
      const consumptionDays = item.consumption_days || 30

      // 現在の残り日数を取得
      const currentDays = item.days_remaining !== undefined ? item.days_remaining : 30

      // 追加される日数を計算 (消費日数 × 1個)
      const additionalDays = consumptionDays * 1

      // 新しい残り日数を計算 (最大120日)
      const newDaysRemaining = Math.min(999, currentDays + additionalDays)

      console.log("購入確認処理:", {
        itemId: item.id,
        currentDays,
        consumptionDays,
        additionalDays,
        newDaysRemaining,
      })

      // 残り日数を更新
      updateDaysRemaining(item.id, newDaysRemaining)

      // 親コンポーネントに新しい残り日数を渡す
      onConfirm(true, newDaysRemaining)
      return
    }

    // 従来の方法
    onConfirm(true)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-pink-100 bg-pink-50/80">
        <DialogHeader>
          <DialogTitle className="text-pink-600 text-xl">購入確認</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {item && (
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white">
                <Image
                  src={imageSrc || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h4 className="font-medium text-xl text-gray-800">{item.name}</h4>
                <p className="text-sm text-pink-500">{item.category}</p>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <p className="text-pink-600">以下のオプションから選択してください：</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start rounded-full border-pink-200 text-pink-600 hover:bg-pink-100 h-14"
                onClick={() => onExternalPurchase("amazon", item)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Amazonで購入する
              </Button>
              <Button
                variant="outline"
                className="justify-start rounded-full border-pink-200 text-pink-600 hover:bg-pink-100 h-14"
                onClick={() => onExternalPurchase("rakuten", item)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                楽天で購入する
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onClose()}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            キャンセル
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-green-400 hover:bg-green-500 rounded-full shadow-md">
            <Check className="mr-2 h-4 w-4" />
            購入済みとしてマーク
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
