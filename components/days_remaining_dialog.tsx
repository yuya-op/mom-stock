"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DaysRemainingDialog({ open, onClose, onConfirm, item }) {
  const [daysRemaining, setDaysRemaining] = useState(120)
  const [consumptionDays, setConsumptionDays] = useState(30)
  const [stockCount, setStockCount] = useState(1)
  const MAX_DAYS = 999
  const MAX_SLIDER_DAYS = 120 // スライダーの最大値

  useEffect(() => {
    if (item && open) {
      // ローカルストレージから消費日数と在庫数を取得
      try {
        const storageKey = `item_${item.id}_metadata`
        const storedData = localStorage.getItem(storageKey)

        if (storedData) {
          const metadata = JSON.parse(storedData)
          setConsumptionDays(metadata.consumption_days || 30)
          setStockCount(metadata.stock_count || 1)
        } else {
          // デフォルト値を設定
          setConsumptionDays(30)
          setStockCount(1)
        }
      } catch (err) {
        console.log("Failed to load from localStorage", err)
        setConsumptionDays(30)
        setStockCount(1)
      }

      // 残り日数は直接アイテムから取得
      setDaysRemaining(item.days_remaining || 30)
    }
  }, [item, open])

  // スライダーの値が変更されたときのハンドラーを追加
  const handleSliderChange = (value) => {
    setDaysRemaining(value)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Calendar className="h-5 w-5 text-pink-400" />
            在庫情報の調整
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">{item.name}の在庫情報を設定します。</p>

          <div className="space-y-6">
            {/* 残り日数のスライダー */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700">残り日数を直接調整</Label>
                <span className="text-sm font-medium">{daysRemaining}日</span>
              </div>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="1"
                  max={MAX_SLIDER_DAYS}
                  value={Math.min(daysRemaining, MAX_SLIDER_DAYS)}
                  onChange={(e) => handleSliderChange(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1日</span>
                  <span>{MAX_SLIDER_DAYS}日</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">スライダーで残り日数を直接調整できます（最大{MAX_SLIDER_DAYS}日）</p>
              {daysRemaining > MAX_SLIDER_DAYS && (
                <p className="text-xs text-amber-500">
                  現在の設定値（{daysRemaining}日）はスライダーの最大値を超えています
                </p>
              )}
            </div>

            {/* 消費日数の入力フィールド */}
            <div className="space-y-2">
              <Label htmlFor="consumptionDays" className="text-gray-700">
                1個あたりの消費日数
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="consumptionDays"
                  type="number"
                  min="1"
                  max="120"
                  value={consumptionDays}
                  onChange={(e) => {
                    setConsumptionDays(Number.parseInt(e.target.value) || 1)
                  }}
                  className="rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                />
                <span className="text-sm text-gray-500">日</span>
              </div>
              <p className="text-xs text-gray-500">
                この商品がどのくらいの期間使用できるかを設定します（残り日数とは独立して設定されます）
              </p>
            </div>

            {/* 在庫数の入力フィールド */}
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            キャンセル
          </Button>
          <Button
            onClick={() => onConfirm(daysRemaining, consumptionDays, stockCount)}
            className="flex-1 bg-pink-400 hover:bg-pink-500 rounded-full"
          >
            設定する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
