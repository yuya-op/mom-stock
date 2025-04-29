"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Barcode, Search } from "lucide-react"
import Image from "next/image"

export function AddItemDialog({ open, onClose, onAdd }) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("その他") // デフォルトカテゴリーを「その他」に設定
  const [totalAmount, setTotalAmount] = useState(100)
  const [daysToEmpty, setDaysToEmpty] = useState(7) // 何日で使い切るかの設定
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedSearchItem, setSelectedSearchItem] = useState(null)

  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    // 名前が空の場合は追加しない
    if (!name.trim()) return

    // 日数から1日あたりの減少率を計算
    const decreaseRate = totalAmount / daysToEmpty

    // 新しいアイテムを追加
    onAdd({
      name,
      category,
      currentAmount: totalAmount,
      totalAmount,
      decreaseRate,
      imageUrl:
        selectedSearchItem?.imageUrl || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      purchaseUrl: "https://www.amazon.co.jp/",
    })

    // フォームをリセット
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setCategory("その他")
    setTotalAmount(100)
    setDaysToEmpty(7)
    setSearchQuery("")
    setSearchResults([])
    setSelectedSearchItem(null)
  }

  const handleSearch = () => {
    // 検索機能のモック
    if (searchQuery.trim() === "") return

    // 検索結果のサンプルデータ
    const mockResults = [
      {
        id: "s1",
        name: `${searchQuery} おむつ Sサイズ`,
        category: "おむつ",
        imageUrl: "/colorful-diaper-stack.png",
      },
      {
        id: "s2",
        name: `${searchQuery} おしりふき`,
        category: "おしりふき",
        imageUrl: "/gentle-care.png",
      },
    ]

    setSearchResults(mockResults)
    setSelectedSearchItem(null)
  }

  const selectSearchResult = (result) => {
    setName(result.name)
    setCategory(result.category)
    setSelectedSearchItem(result)
    setSearchResults([])
  }

  // 商品情報入力フォーム（手動入力と検索結果選択後で共通利用）
  const renderItemForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-gray-700">
          商品名
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category" className="text-gray-700">
          カテゴリ
        </Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger
            id="category"
            className="rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
          >
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-200">
            <SelectItem value="おむつ">おむつ</SelectItem>
            <SelectItem value="ケア用品">ケア用品</SelectItem>
            <SelectItem value="食料品">食料品</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="daysToEmpty">何日くらいで使い切る予定ですか？</Label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg"></div>
              <div
                className="absolute top-0 left-0 h-2 bg-pink-200 rounded-lg"
                style={{ width: `${((daysToEmpty - 1) / 29) * 100}%` }}
              ></div>
              <div
                className="absolute -top-1 h-4 w-4 bg-pink-400 rounded-full border-2 border-white shadow cursor-pointer"
                style={{
                  left: `${((daysToEmpty - 1) / 29) * 100}%`,
                  transform: "translateX(-50%)",
                }}
                onMouseDown={(e) => {
                  const handleMouseMove = (moveEvent) => {
                    const slider = e.target.parentElement
                    const rect = slider.getBoundingClientRect()
                    const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
                    const newValue = Math.round(percent * 29) + 1
                    setDaysToEmpty(newValue)
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove)
                    document.removeEventListener("mouseup", handleMouseUp)
                  }

                  document.addEventListener("mousemove", handleMouseMove)
                  document.addEventListener("mouseup", handleMouseUp)
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>1日</span>
              <span>30日</span>
            </div>
          </div>
          <div className="w-12 text-center font-medium">{daysToEmpty}日</div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm()
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200">
        <DialogHeader className="bg-gray-50 pb-4">
          <DialogTitle className="text-gray-800">新しいアイテムを追加</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="barcode">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-full p-1">
            <TabsTrigger
              value="barcode"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              バーコード
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              検索
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              手動入力
            </TabsTrigger>
          </TabsList>

          <TabsContent value="barcode" className="py-4">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Barcode className="h-16 w-16 text-gray-400" />
              <p className="text-center text-sm text-gray-500">
                カメラを起動してバーコードをスキャンします。
                <br />
                （この機能はデモでは利用できません）
              </p>
              <Button variant="outline" disabled>
                スキャン開始
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="search">
            {!selectedSearchItem ? (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="商品名で検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                  />
                  <Button type="button" size="icon" onClick={handleSearch} className="bg-gray-700 hover:bg-gray-800">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="grid gap-2 max-h-[200px] overflow-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => selectSearchResult(result)}
                      >
                        <div className="relative h-10 w-10 overflow-hidden rounded">
                          <Image
                            src={result.imageUrl || "/placeholder.svg"}
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{result.name}</div>
                          <div className="text-xs text-gray-500">{result.category}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="py-2 px-4 bg-gray-50 rounded-lg mb-4 flex items-center">
                  <div className="relative h-10 w-10 overflow-hidden rounded mr-3">
                    <Image
                      src={selectedSearchItem.imageUrl || "/placeholder.svg"}
                      alt={selectedSearchItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedSearchItem.name}</div>
                    <div className="text-xs text-gray-500">検索結果から選択</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-gray-500"
                    onClick={() => {
                      setSelectedSearchItem(null)
                      setSearchQuery("")
                    }}
                  >
                    変更
                  </Button>
                </div>
                {renderItemForm()}
                <DialogFooter>
                  <Button type="button" onClick={handleSubmit} className="bg-pink-400 hover:bg-pink-500 rounded-full">
                    追加
                  </Button>
                </DialogFooter>
              </>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit}>
              {renderItemForm()}
              <DialogFooter>
                <Button type="submit" className="bg-pink-400 hover:bg-pink-500 rounded-full">
                  追加
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
