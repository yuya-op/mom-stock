"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { Capacitor } from "@capacitor/core"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { CapacitorBarcodeScanner } from "@/components/capacitor-barcode-scanner"
import type { ProductInfo } from "@/services/product-service"

interface AddItemDialogProps {
  onAddItem: (item: {
    name: string
    category: string
    quantity: number
    days_remaining: number
  }) => void
}

export function AddItemDialog({ onAddItem }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [daysRemaining, setDaysRemaining] = useState("30")
  const isMobile = useMobile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddItem({
      name,
      category,
      quantity: Number.parseInt(quantity),
      days_remaining: Number.parseInt(daysRemaining),
    })
    resetForm()
    setOpen(false)
  }

  const resetForm = () => {
    setName("")
    setCategory("")
    setQuantity("1")
    setDaysRemaining("30")
    setActiveTab("manual")
  }

  const handleProductFound = (product: ProductInfo) => {
    setName(product.name)
    setCategory(product.category || "")
    setActiveTab("manual") // 商品情報が見つかったら手動タブに切り替え
  }

  const handleScanError = () => {
    setActiveTab("manual") // エラー時は手動タブに切り替え
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-pink-400 hover:bg-pink-500">
          <PlusCircle className="mr-2 h-4 w-4" />
          新しいアイテムを追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいアイテムを追加</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">手動入力</TabsTrigger>
            {isMobile && <TabsTrigger value="barcode">バーコード</TabsTrigger>}
          </TabsList>
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">アイテム名</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリー</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaper">おむつ</SelectItem>
                    <SelectItem value="food">食品</SelectItem>
                    <SelectItem value="care">ケア用品</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">数量</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days_remaining">残り日数</Label>
                  <Input
                    id="days_remaining"
                    type="number"
                    min="1"
                    value={daysRemaining}
                    onChange={(e) => setDaysRemaining(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-pink-400 hover:bg-pink-500">
                  追加
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="barcode">
            {Capacitor.isNativePlatform() ? (
              <CapacitorBarcodeScanner
                onProductFound={handleProductFound}
                onCancel={() => setActiveTab("manual")}
                onError={handleScanError}
              />
            ) : (
              <BarcodeScanner
                onProductFound={handleProductFound}
                onCancel={() => setActiveTab("manual")}
                onError={handleScanError}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
