"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ShoppingCart, AlertTriangle } from "lucide-react"
import { PurchaseConfirmDialog } from "@/components/purchase-confirm-dialog"

export function ItemCard({ item, updateAmount, isMobile }) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  const percentage = (item.currentAmount / item.totalAmount) * 100
  const isLowStock = percentage < 30

  const handleSliderChange = (value) => {
    updateAmount(item.id, (value[0] / 100) * item.totalAmount)
  }

  const handlePurchaseConfirm = (confirmed) => {
    if (confirmed) {
      updateAmount(item.id, item.totalAmount)
    }
    setShowPurchaseDialog(false)
  }

  return (
    <>
      <Card className={`${isLowStock ? "border-red-200" : "border-pink-100"} rounded-2xl shadow-sm overflow-hidden`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base text-pink-600">{item.name}</CardTitle>
            {isLowStock && <AlertTriangle className="h-5 w-5 text-red-500" />}
          </div>
          <div className="text-xs text-pink-500">{item.category}</div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>残量</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <Progress
                value={percentage}
                className="h-2 bg-pink-100"
                indicatorClassName="bg-gradient-to-r from-pink-400 to-purple-400"
              />
              {isAdjusting && (
                <div className="mt-2">
                  <Slider
                    defaultValue={[percentage]}
                    max={100}
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
            {isAdjusting ? "完了" : "調整"}
          </Button>
          <Button
            size="sm"
            className={`rounded-full ${
              isLowStock
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
