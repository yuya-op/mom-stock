"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Check, X } from "lucide-react"
import { getCategoryImage } from "@/utils/get-category-image"
import { useToast } from "@/hooks/use-toast"

export function PurchaseResultDialog({ open, onClose, onResult, item, store, updateDaysRemaining, setDaysRemaining }) {
  const [purchaseCount, setPurchaseCount] = useState(1)
  const { toast } = useToast()

  // ダイアログが開くたびに購入個数をリセット
  useEffect(() => {
    if (open) {
      setPurchaseCount(1)
    }
  }, [open])

  if (!item) return null

  // カテゴリに基づいた画像パスを取得
  const imageSrc = getCategoryImage(item.category, item.imageUrl)

  const handlePurchaseConfirm = async (purchased) => {
    if (purchased && item) {
      try {
        // ローカルストレージから消費日数を取得
        const consumptionDays = item.consumption_days || 30

        // 現在の残り日数を取得
        const currentDays = item.days_remaining !== undefined ? item.days_remaining : 30

        // 追加される日数を計算 (消費日数 × 購入個数)
        const additionalDays = consumptionDays * purchaseCount

        // 新しい残り日数を計算 (最大120日)
        const newDaysRemaining = Math.min(999, currentDays + additionalDays)

        console.log("購入処理:", {
          itemId: item.id,
          currentDays,
          consumptionDays,
          purchaseCount,
          additionalDays,
          newDaysRemaining,
        })

        // 残り日数を更新
        if (updateDaysRemaining && typeof updateDaysRemaining === "function") {
          const success = await updateDaysRemaining(item.id, newDaysRemaining)

          if (success) {
            // 成功メッセージを表示
            toast({
              title: "在庫更新完了",
              description: `${item.name}の残り日数が${newDaysRemaining}日に更新されました`,
            })

            // UI上の残り日数も更新
            if (setDaysRemaining && typeof setDaysRemaining === "function") {
              setDaysRemaining(newDaysRemaining)
            }

            // 購入履歴に追加するためのAPIを呼び出す
            try {
              await fetch("/api/purchase-history", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  item_id: item.id,
                  price: 0, // 価格情報がない場合は0円として記録
                  purchased_at: new Date().toISOString(), // 購入ボタンを押した時点の日時
                  quantity: purchaseCount, // 購入個数を追加
                }),
              })
            } catch (err) {
              console.error("Failed to record purchase history:", err)
              // 履歴の記録に失敗しても、在庫更新は成功しているので続行
            }

            // 親コンポーネントに新しい残り日数を渡す
            onResult(purchased, newDaysRemaining)
            return
          } else {
            toast({
              title: "エラー",
              description: "在庫の更新に失敗しました",
              variant: "destructive",
            })
          }
        } else {
          console.error("updateDaysRemaining is not a function", updateDaysRemaining)
          toast({
            title: "エラー",
            description: "更新機能が利用できません",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Failed to update item:", err)
        toast({
          title: "エラー",
          description: "在庫の更新に失敗しました",
          variant: "destructive",
        })
      }
    }

    // 元のonResultも呼び出す
    onResult(purchased)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-pink-100 bg-pink-50/80">
        <DialogHeader>
          <DialogTitle className="text-pink-600 text-xl">購入確認</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <div className="text-center">
            <p className="text-gray-700 mb-2">
              {store === "amazon" ? "Amazon" : "楽天"}で{item.name}を購入しましたか？
            </p>
            <p className="text-sm text-gray-500">「はい」を選ぶと在庫が更新されます</p>
          </div>

          {/* 購入個数入力フィールドを追加 */}
          <div className="grid gap-2 bg-white p-3 rounded-lg">
            <Label htmlFor="purchaseCount" className="text-gray-700">
              購入個数
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="purchaseCount"
                type="number"
                min="1"
                max="10"
                value={purchaseCount}
                onChange={(e) => setPurchaseCount(Number(e.target.value) || 1)}
                className="rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-500">個</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => handlePurchaseConfirm(false)}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <X className="mr-2 h-4 w-4" />
            いいえ
          </Button>
          <Button
            onClick={() => handlePurchaseConfirm(true)}
            className="flex-1 bg-green-400 hover:bg-green-500 rounded-full shadow-md"
          >
            <Check className="mr-2 h-4 w-4" />
            はい
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
