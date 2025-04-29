"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Check, X } from "lucide-react"

export function PurchaseResultDialog({ open, onClose, onResult, item, store }) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-pink-100 bg-pink-50/80">
        <DialogHeader>
          <DialogTitle className="text-pink-600 text-xl">購入確認</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-blue-100">
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
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
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onResult(false)}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <X className="mr-2 h-4 w-4" />
            いいえ
          </Button>
          <Button
            onClick={() => onResult(true)}
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
