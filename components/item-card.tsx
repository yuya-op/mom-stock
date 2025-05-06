"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ShoppingCart, AlertTriangle } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"

export function ItemCard({ item, updateDaysRemaining, isMobile }) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(
    item.days_remaining !== undefined
      ? item.days_remaining
      : item.currentAmount && item.decrease_rate
        ? Math.ceil(item.currentAmount / item.decrease_rate)
        : 30,
  )

  // 残り日数のパーセンテージを計算（最大30日を100%とする）
  const daysPercentage = Math.min(
    100,
    ((item.days_remaining !== undefined
      ? item.days_remaining
      : item.currentAmount && item.decrease_rate
        ? Math.ceil(item.currentAmount / item.decrease_rate)
        : 30) /
      30) *
      100,
  )
  const isLowDays =
    (item.days_remaining !== undefined
      ? item.days_remaining
      : item.currentAmount && item.decrease_rate
        ? Math.ceil(item.currentAmount / item.decrease_rate)
        : 30) <= 5 // 残り5日以下で警告表示

  const handleSliderChange = (value) => {
    const newDays = value[0]
    setDaysRemaining(newDays)
    updateDaysRemaining(item.id, newDays)
  }

  const handlePurchaseConfirm = (confirmed) => {
    if (confirmed) {
      // 購入済みとしてマークされた場合、残り日数を30日（デフォルト）にリセット
      updateDaysRemaining(item.id, 30)
      setDaysRemaining(30)
    }
    setShowPurchaseDialog(false)
  }

  const getCategoryImage = (category, imageUrl) => {
    if (imageUrl) {
      return imageUrl
    }
    switch (category) {
      case "飲料":
        return "/category/drink.png"
      case "食料品":
        return "/category/food.png"
      case "日用品":
        return "/category/daily.png"
      default:
        return "/placeholder.svg"
    }
  }

  return (
    <>
      <Card className={`${isLowDays ? "border-red-200" : "border-pink-100"} rounded-2xl shadow-sm overflow-hidden`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base text-pink-600">{item.name}</CardTitle>
            {isLowDays && <AlertTriangle className="h-5 w-5 text-red-500" />}
          </div>
          <div className="text-xs text-pink-500">{item.category}</div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={getCategoryImage(item.category, item.imageUrl) || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>残り日数</span>
                <span>
                  {item.days_remaining !== undefined
                    ? item.days_remaining
                    : item.currentAmount && item.decrease_rate
                      ? Math.ceil(item.currentAmount / item.decrease_rate)
                      : 30}
                  日
                </span>
              </div>
              <Progress
                value={daysPercentage}
                className="h-2 bg-pink-100"
                indicatorClassName="bg-gradient-to-r from-pink-400 to-purple-400"
              />
              {isAdjusting && (
                <div className="mt-2">
                  <Slider
                    defaultValue={[daysRemaining]}
                    max={30}
                    min={1}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="[&_[role=slider]]:bg-pink-400 [&_[role=slider]]:border-pink-200"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdjusting(!isAdjusting)}
            className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            {isAdjusting ? "完了" : "日数調整"}
          </Button>
          <Button
            size="sm"
            className={`rounded-full ${
              isLowDays
                ? "bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500"
                : "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
            }`}
            onClick={() => {
              if (isMobile) {
                // モバイルの場合は確認ダイアログを表示
                setShowPurchaseDialog(true)
              } else {
                // PCの場合は直接購入ページへ
                window.open(item.purchaseUrl, "_blank")
                setShowPurchaseDialog(true)
              }
            }}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            購入
          </Button>
        </CardFooter>
      </Card>
      <PurchaseConfirmDialog
        open={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onConfirm={handlePurchaseConfirm}
        item={item}
      />
    </>
  )
}
