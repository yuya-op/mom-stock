"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ShoppingCart, Check } from "lucide-react"

export function PurchaseConfirmDialog({ open, onClose, onConfirm, item, onExternalPurchase }) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-pink-100 bg-pink-50/80">
        <DialogHeader>
          <DialogTitle className="text-pink-600 text-xl">購入確認</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {item && (
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-blue-100">
                <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
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
            onClick={() => onConfirm(false)}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            キャンセル
          </Button>
          <Button
            onClick={() => onConfirm(true)}
            className="flex-1 bg-green-400 hover:bg-green-500 rounded-full shadow-md"
          >
            <Check className="mr-2 h-4 w-4" />
            購入済みとしてマーク
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
