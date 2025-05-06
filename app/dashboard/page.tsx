"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Home, ShoppingBag, BarChart2, Plus, AlertTriangle, Loader2 } from "lucide-react"
import { AddItemDialog } from "@/components/add-item-dialog"
import { ItemDetailDialog } from "@/components/item-detail-dialog"
import { PurchaseResultDialog } from "@/components/purchase-result-dialog"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useMobile } from "@/hooks/use-mobile"
import { useNotifications } from "@/hooks/use-notifications"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { useItems } from "@/hooks/use-items"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getCategoryImage } from "@/utils/get-category-image"
import { useToast } from "@/hooks/use-toast"
import { getDaysRemaining, isLowOnDays, getDaysPercentage } from "@/utils/days-remaining"

// アイテムの型定義
interface Item {
  id: number
  name: string
  category: string
  days_remaining?: number
  currentAmount?: number
  totalAmount?: number
  decrease_rate?: number
  imageUrl: string | null
  purchaseUrl: string
  user_id?: string
  last_updated?: string
  // フロントエンドでのみ使用する値
  consumption_days?: number
  stock_count?: number
}

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [useNewSchema, setUseNewSchema] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [purchaseStore, setPurchaseStore] = useState<string | null>(null)
  const [showPurchaseResultDialog, setShowPurchaseResultDialog] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(30)

  const isMobile = useMobile()
  const { notifications, addLowStockNotification, markAllAsRead } = useNotifications()
  const { shoppingList, addToShoppingList } = useShoppingList()
  const { items, isLoading, updateDaysRemaining, updateItemInfo, addItem, deleteItem, fetchItems } = useItems()
  const router = useRouter()
  const { toast } = useToast()

  // 初期化済みかどうかを追跡するためのref
  const initializedRef = useRef(false)

  // ユーザーセッションの確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        // セッションを取得
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          // セッションがない場合はログインページにリダイレクト
          router.push("/login")
          return
        }

        const uid = session.user.id
        setUserId(uid)

        // 常に古いスキーマを使用する
        setUseNewSchema(false)

        // 初期状態で残り日数が5日以下のアイテムの通知を作成（初回のみ）
        if (!initializedRef.current && items.length > 0) {
          items.forEach((item) => {
            if (isLowOnDays(item)) {
              addLowStockNotification(item)
            }
          })
          initializedRef.current = true
        }
      } catch (err) {
        console.error("Error checking session:", err)
        setError("セッションの確認中にエラーが発生しました")
      }
    }

    checkSession()
  }, [addLowStockNotification, items, router])

  // 外部サイトから戻ってきたときの処理
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const fromStore = urlParams.get("from_store")
      const itemId = urlParams.get("item_id")

      if (fromStore && itemId) {
        // 該当するアイテムを探す
        const item = items.find((i) => i.id.toString() === itemId)
        if (item) {
          setSelectedItem(item)
          setPurchaseStore(fromStore)
          setShowPurchaseResultDialog(true)

          // URLパラメータをクリア
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }
  }, [items])

  // 買い物リストに追加する処理
  const handleAddToShoppingList = async (item: Item) => {
    await addToShoppingList(item.id)
    setShowDetailDialog(false)
  }

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    setDaysRemaining(getDaysRemaining(item))
    setShowDetailDialog(true)
  }

  const categories = ["すべて", "おむつ", "ケア用品", "食料品", "その他"]
  const [activeCategory, setActiveCategory] = useState("すべて")

  const filteredItems = activeCategory === "すべて" ? items : items.filter((item) => item.category === activeCategory)

  const lowDaysItems = items.filter(isLowOnDays)

  // 残り日数に応じたプログレスバーの色を取得する関数
  const getProgressColor = (days: number) => {
    if (days <= 3) {
      return "!bg-red-500" // 3日以下: 赤
    } else if (days <= 7) {
      return "!bg-orange-500" // 7日以下: オレンジ
    } else if (days <= 14) {
      return "!bg-yellow-500" // 14日以下: 黄色
    } else {
      return "!bg-green-500" // それ以上: 緑
    }
  }

  const handlePurchaseResult = (purchased) => {
    // 購入結果ダイアログを閉じる
    setShowPurchaseResultDialog(false)

    // 購入が完了した場合、アイテムリストを再取得
    if (purchased) {
      fetchItems()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 lg:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2">
              <Image src="/app-icon.png" alt="mom-stockアイコン" width={32} height={32} className="rounded-md" />
            </div>
            <span className="text-xl font-bold text-gray-800">mom-stock</span>
          </div>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <NotificationsDropdown notifications={notifications} markAllAsRead={markAllAsRead} />
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-pink-50 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-pink-400"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>{" "}
          </div>
          <h1 className="text-lg font-semibold md:text-xl text-gray-800">在庫管理</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <div className="overflow-auto">
          <div className="flex space-x-2 pb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={`rounded-full text-xs px-3 py-1 h-auto ${
                  activeCategory === category
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400 mb-4" />
            <p className="text-gray-500">データを読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                // 残り日数のパーセンテージを計算（最大30日を100%とする）
                const daysPercentage = getDaysPercentage(item)
                const isLowDays = isLowOnDays(item)
                const itemDaysRemaining = getDaysRemaining(item)
                const progressColor = getProgressColor(itemDaysRemaining)

                // カテゴリに基づいた画像パスを取得
                const imageSrc = getCategoryImage(item.category, item.imageUrl)

                return (
                  <div
                    key={item.id}
                    className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg flex-shrink-0 bg-gray-100">
                          <Image
                            src={imageSrc || "/placeholder.svg"}
                            alt={item.category}
                            width={56}
                            height={56}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">{item.category}</p>
                          <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                          {isLowDays && <p className="text-xs text-red-500 mt-1">残り{itemDaysRemaining}日</p>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>残り{itemDaysRemaining}日</span>
                          {isLowDays && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        </div>
                        <Progress
                          value={daysPercentage}
                          className="h-1.5 mt-1 bg-gray-100"
                          indicatorClassName={`${progressColor}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">該当するアイテムがありません</div>
            )}
          </div>
        )}
      </main>
      <div className="sticky bottom-0 border-t bg-white p-2">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-pink-500">
            <Home className="h-5 w-5" />
            <span className="text-xs">ホーム</span>
          </Button>
          <Link href="/shopping-list">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800 relative"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {shoppingList.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {shoppingList.length}
                  </span>
                )}
              </div>
              <span className="text-xs">買い物リスト</span>
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs">履歴 / 分析</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* フローティング追加ボタン */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button
          className="h-14 w-14 rounded-full bg-pink-400 hover:bg-pink-500 shadow-lg"
          onClick={() => setShowAddDialog(true)}
          disabled={isLoading}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddItemDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={addItem} />
      <ItemDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        item={selectedItem}
        updateDaysRemaining={updateDaysRemaining}
        updateItemInfo={updateItemInfo}
        addToShoppingList={handleAddToShoppingList}
        deleteItem={deleteItem}
      />

      {/* 外部サイトからの戻り時の購入確認ダイアログ */}
      <PurchaseResultDialog
        open={showPurchaseResultDialog}
        onClose={() => setShowPurchaseResultDialog(false)}
        onResult={handlePurchaseResult}
        item={selectedItem}
        store={purchaseStore}
        updateDaysRemaining={updateDaysRemaining}
        setDaysRemaining={setDaysRemaining}
      />
    </div>
  )
}
