"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PriceInputDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (price: number) => void
  itemName: string
}

export function PriceInputDialog({ open, onClose, onConfirm, itemName }: PriceInputDialogProps) {
  const [price, setPrice] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericPrice = price ? Number.parseInt(price, 10) : 0
    onConfirm(numericPrice)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-800">購入価格の入力</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{itemName}</span> の購入価格を入力してください。
            </p>
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-gray-700">
                価格（円）
              </Label>
              <div className="flex items-center">
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-l-lg border-gray-200"
                  placeholder="0"
                />
                <span className="bg-gray-100 px-3 py-2 rounded-r-lg border border-l-0 border-gray-200 text-gray-600">
                  円
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              キャンセル
            </Button>
            <Button type="submit" className="flex-1 bg-pink-400 hover:bg-pink-500 rounded-full">
              確定
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
