"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Barcode, Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { getProductByBarcode } from "@/lib/barcode-service"
import { supabase } from "@/lib/supabase"

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
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false)
  const [barcodeError, setBarcodeError] = useState(null)
  const [scannedBarcode, setScannedBarcode] = useState(null)

  // スライダーの最大値を120日に設定
  const MAX_DAYS = 999

  // 消費日数と在庫数から残り日数を計算
  useEffect(() => {
    const calculatedDays = consumptionDays * stockCount
    // 最大値を超えないように制限（999日まで）
    setDaysRemaining(Math.min(calculatedDays, 999))
  }, [consumptionDays, stockCount])

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
        selectedSearchItem?.imageUrl || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      purchaseUrl: "https://www.amazon.co.jp/",
    })

    // バーコード情報がある場合、バーコードテーブルに保存
    if (scannedBarcode) {
      saveBarcode(scannedBarcode)
    }

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

  // バーコード情報をSupabaseに保存
  const saveBarcode = async (barcode) => {
    try {
      // 最新のアイテムIDを取得する必要があります
      // 注: 実際の実装では、onAddの戻り値などで正確なIDを取得する必要があります
      const { data: items, error } = await supabase
        .from("items")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching latest item:", error)
        return
      }

      if (items && items.length > 0) {
        const latestItemId = items[0].id

        // バーコード情報を保存
        await supabase.from("product_barcodes").upsert({
          barcode: barcode,
          product_id: latestItemId,
        })
      }
    } catch (err) {
      console.error("Error saving barcode:", err)
    }
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
    setScannedBarcode(null)
    setBarcodeError(null)
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

  // バーコードスキャン開始
  const startBarcodeScanner = () => {
    setShowBarcodeScanner(true)
  }

  // バーコードスキャン結果の処理
  const handleBarcodeDetected = async (barcode) => {
    setShowBarcodeScanner(false)
    setIsLoadingBarcode(true)
    setBarcodeError(null)
    setScannedBarcode(barcode)

    try {
      // バーコードから商品情報を取得
      const productInfo = await getProductByBarcode(barcode)

      if (productInfo) {
        // 商品情報をフォームに設定
        setName(productInfo.name)
        setCategory(productInfo.category)
        if (productInfo.consumption_days) {
          setConsumptionDays(productInfo.consumption_days)
        }
        if (productInfo.imageUrl) {
          setSelectedSearchItem({
            imageUrl: productInfo.imageUrl,
          })
        }
      } else {
        // 商品情報が見つからない場合
        setBarcodeError(
          `バーコード(${barcode})に対応する商品情報が見つかりませんでした。手動で情報を入力してください。`,
        )
      }
    } catch (err) {
      console.error("Error processing barcode:", err)
      setBarcodeError("バーコード情報の取得中にエラーが発生しました。手動で情報を入力してください。")
    } finally {
      setIsLoadingBarcode(false)
    }
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
    <>
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

            <TabsContent value="barcode" className="min-h-[300px] overflow-auto">
              {isLoadingBarcode ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />
                  <p className="text-center text-sm text-gray-500">バーコード情報を取得中...</p>
                </div>
              ) : scannedBarcode ? (
                <div className="p-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-700 font-medium">バーコードをスキャンしました</p>
                    <p className="text-sm text-green-600">バーコード: {scannedBarcode}</p>
                  </div>

                  {barcodeError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-amber-700 text-sm">{barcodeError}</p>
                    </div>
                  )}

                  {renderItemForm()}

                  <div className="text-xs text-gray-500 mb-4">
                    {name || "アイテム"}の残り日数は{consumptionDays}日/個 × {stockCount}個(追加個数) = {daysRemaining}
                    日として計算されます。
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setScannedBarcode(null)
                        setBarcodeError(null)
                      }}
                    >
                      再スキャン
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-pink-400 hover:bg-pink-500 rounded-full"
                    >
                      追加
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <Barcode className="h-16 w-16 text-gray-400" />
                  <p className="text-center text-sm text-gray-500">カメラを起動してバーコードをスキャンします。</p>
                  <Button variant="outline" onClick={startBarcodeScanner}>
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

      {/* バーコードスキャナーコンポーネント */}
      {showBarcodeScanner && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowBarcodeScanner(false)} />
      )}
    </>
  )
}
