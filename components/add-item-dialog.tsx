"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Barcode, Search, Smartphone } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import { BarcodeScanner } from "./barcode-scanner"
import type { ProductInfo } from "@/services/product-service"

export function AddItemDialog({ open, onClose, onAdd }) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("その他") // デフォルトカテゴリーを「その他」に設定
  // デフォルト値を120日に設定
  const [daysRemaining, setDaysRemaining] = useState(120)
  const [consumptionDays, setConsumptionDays] = useState(30) // 1個あたりの消費日数
  const [stockCount, setStockCount] = useState(1) // 在庫数
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedSearchItem, setSelectedSearchItem] = useState(null)
  const [activeTab, setActiveTab] = useState("manual") // デフォルトタブを変更
  const [scannerActive, setScannerActive] = useState(false)
  const [productImage, setProductImage] = useState<string | null>(null)
  const isMobile = useMobile() // モバイルデバイスかどうかを判定

  // スライダーの最大値を120日に設定
  const MAX_DAYS = 999

  // 消費日数と在庫数から残り日数を計算
  useEffect(() => {
    const calculatedDays = consumptionDays * stockCount
    // 最大値を超えないように制限（999日まで）
    setDaysRemaining(Math.min(calculatedDays, 999))
  }, [consumptionDays, stockCount])

  // バーコードタブを選択した時にスキャナーをアクティブにする
  useEffect(() => {
    if (activeTab === "barcode" && isMobile) {
      setScannerActive(true)
    } else {
      setScannerActive(false)
    }
  }, [activeTab, isMobile])

  // スキャナーで商品が見つかった時の処理
  const handleProductFound = (product: ProductInfo) => {
    setName(product.name)
    setCategory(product.category)
    setProductImage(product.imageUrl)
    if (product.price) {
      // その他の情報も設定可能
    }
    setScannerActive(false)
    setActiveTab("manual") // 手動入力タブに切り替え
  }

  // スキャナーでエラーが発生した時の処理
  const handleScannerError = () => {
    setScannerActive(false)
    setActiveTab("manual") // 手動入力タブに切り替え
  }

  // handleSubmit関数を修正して、データベースに保存する値を調整
  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    // 名前が空の場合は追加しない
    if (!name.trim()) return

    // 新しいアイテムを追加
    onAdd({
      name,
      category,
      days_remaining: daysRemaining,
      // 以下のフィールドはデータベースには保存されないが、UIで使用
      // consumption_days: consumptionDays,
      // stock_count: stockCount,
      // Add old schema fields for backward compatibility
      currentAmount: 100, // Start with 100%
      totalAmount: 100,
      decrease_rate: 100 / 30, // Rate to empty in 30 days
      imageUrl:
        productImage ||
        selectedSearchItem?.imageUrl ||
        `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      purchaseUrl: "https://www.amazon.co.jp/",
    })

    // アイテムが追加された後、ローカルストレージに消費日数と在庫数を保存するためのコールバック
    setTimeout(() => {
      try {
        // 最新のアイテムIDを取得（実際の実装では、onAddの戻り値などで取得する必要がある）
        const itemId = Date.now() // 仮のID
        const storageKey = `item_${itemId}_metadata`
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            consumption_days: consumptionDays,
            stock_count: stockCount,
          }),
        )
      } catch (err) {
        console.log("Failed to save to localStorage", err)
      }
    }, 500)

    // フォームをリセット
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setCategory("その他")
    setDaysRemaining(120)
    setConsumptionDays(30)
    setStockCount(1)
    setSearchQuery("")
    setSearchResults([])
    setSelectedSearchItem(null)
    setProductImage(null)
    setActiveTab("manual")
    setScannerActive(false)
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
    setProductImage(result.imageUrl)
    setSearchResults([])
  }

  // 商品情報入力フォーム（手動入力と検索結果選択後で共通利用）
  const renderItemForm = () => (
    <div className="grid gap-4 py-4">
      {/* 商品画像がある場合は表示 */}
      {productImage && (
        <div className="flex justify-center mb-2">
          <div className="relative w-24 h-24 overflow-hidden rounded-lg border">
            <Image src={productImage || "/placeholder.svg"} alt={name || "商品画像"} fill className="object-cover" />
          </div>
        </div>
      )}

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
            onChange={(e) => setConsumptionDays(Number.parseInt(e.target.value) || 1)}
            className="rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
          />
          <span className="text-sm text-gray-500">日</span>
        </div>
        <p className="text-xs text-gray-500">この商品が1個でどのくらいの期間使用できるかを入力してください</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="stockCount" className="text-gray-700">
          追加個数
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="stockCount"
            type="number"
            min="1"
            max="10"
            value={stockCount}
            onChange={(e) => setStockCount(Number.parseInt(e.target.value) || 1)}
            className="rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
          />
          <span className="text-sm text-gray-500">個</span>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="calculatedDays" className="text-gray-700">
          計算された残り日数
        </Label>
        <div className="flex items-center gap-2">
          <div className="bg-gray-50 rounded-full px-4 py-2 w-full text-center font-medium">{daysRemaining}日</div>
        </div>
        <p className="text-xs text-gray-500">残り日数は「1個あたりの消費日数 × 在庫数」で自動計算されます</p>
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
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200 max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="bg-gray-50 pb-4">
          <DialogTitle className="text-gray-800">新しいアイテムを追加</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-full p-1">
            <TabsTrigger
              value="barcode"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-800"
              disabled={!isMobile} // モバイルでない場合は無効化
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

          <TabsContent value="barcode" className="min-h-[300px] overflow-auto">
            {!isMobile ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Smartphone className="h-16 w-16 text-gray-400" />
                <p className="text-center text-sm text-gray-500">
                  バーコードスキャン機能はモバイルデバイスでのみ利用できます。
                </p>
              </div>
            ) : scannerActive ? (
              <BarcodeScanner
                onProductFound={handleProductFound}
                onCancel={() => {
                  setScannerActive(false)
                  setActiveTab("manual")
                }}
                onError={handleScannerError}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Barcode className="h-16 w-16 text-gray-400" />
                <p className="text-center text-sm text-gray-500">カメラを起動してバーコードをスキャンします。</p>
                <Button variant="outline" onClick={() => setScannerActive(true)} className="rounded-full">
                  スキャン開始
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="overflow-auto">
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
                {/* 説明文を修正 */}
                <div className="text-xs text-gray-500 mb-4">
                  {name || "アイテム"}の残り日数は{consumptionDays}日/個 × {stockCount}個(追加個数) = {daysRemaining}
                  日として計算されます。
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleSubmit} className="bg-pink-400 hover:bg-pink-500 rounded-full">
                    追加
                  </Button>
                </DialogFooter>
              </>
            )}
          </TabsContent>

          <TabsContent value="manual" className="overflow-auto">
            <form onSubmit={handleSubmit}>
              {renderItemForm()}
              {/* 説明文を修正 */}
              <div className="text-xs text-gray-500 mb-4">
                {name || "アイテム"}の残り日数は{consumptionDays}日/個 × {stockCount}個(追加個数) = {daysRemaining}
                日として計算されます。
              </div>
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
