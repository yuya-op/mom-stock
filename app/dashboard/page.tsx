"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Home, ShoppingBag, ThumbsUp, Plus, AlertTriangle } from "lucide-react"
import { AddItemDialog } from "@/components/add-item-dialog"
import { ItemDetailDialog } from "@/components/item-detail-dialog"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useMobile } from "@/hooks/use-mobile"
import { useNotifications } from "@/hooks/use-notifications"

export default function Dashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [shoppingList, setShoppingList] = useState([])
  const isMobile = useMobile()
  const { notifications, addLowStockNotification, markAllAsRead } = useNotifications()

  // 初期化済みかどうかを追跡するためのref
  const initializedRef = useRef(false)

  useEffect(() => {
    // サンプルデータをロード
    const sampleItems = [
      {
        id: 1,
        name: "パンパース テープ Sサイズ",
        category: "おむつ",
        currentAmount: 22,
        totalAmount: 100,
        decreaseRate: 5, // 1日あたりの減少量
        imageUrl: "/colorful-diaper-stack.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 2,
        name: "ムーニー おしりふき",
        category: "おむつ",
        currentAmount: 28,
        totalAmount: 100,
        decreaseRate: 3,
        imageUrl: "/gentle-care.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 3,
        name: "ピジョン 綿棒",
        category: "ケア用品",
        currentAmount: 79,
        totalAmount: 100,
        decreaseRate: 1,
        imageUrl: "/pile-of-cotton-swabs.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 4,
        name: "ベビーローション",
        category: "ケア用品",
        currentAmount: 44,
        totalAmount: 100,
        decreaseRate: 2,
        imageUrl: "/gentle-care.png",
        purchaseUrl: "https://www.rakuten.co.jp/",
      },
      {
        id: 5,
        name: "和光堂 ベビーフード",
        category: "食料品",
        currentAmount: 17,
        totalAmount: 100,
        decreaseRate: 4,
        imageUrl: "/assortment-baby-food.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 6,
        name: "明治 ほほえみ",
        category: "食料品",
        currentAmount: 48,
        totalAmount: 100,
        decreaseRate: 3,
        imageUrl: "/infant-feeding-essentials.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      // 生活必需品の追加
      {
        id: 7,
        name: "トイレットペーパー",
        category: "その他",
        currentAmount: 35,
        totalAmount: 100,
        decreaseRate: 4,
        imageUrl: "/toilet-paper.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 8,
        name: "キッチンペーパー",
        category: "その他",
        currentAmount: 52,
        totalAmount: 100,
        decreaseRate: 2,
        imageUrl: "/kitchen-paper.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 9,
        name: "洗濯洗剤",
        category: "その他",
        currentAmount: 68,
        totalAmount: 100,
        decreaseRate: 1,
        imageUrl: "/laundry-detergent.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 10,
        name: "食器用洗剤",
        category: "その他",
        currentAmount: 25,
        totalAmount: 100,
        decreaseRate: 2,
        imageUrl: "/dish-soap.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
      {
        id: 11,
        name: "ティッシュペーパー",
        category: "その他",
        currentAmount: 15,
        totalAmount: 100,
        decreaseRate: 3,
        imageUrl: "/tissue-paper.png",
        purchaseUrl: "https://www.amazon.co.jp/",
      },
    ]
    setItems(sampleItems)

    // 初期状態で20%以下のアイテムの通知を作成（初回のみ）
    if (!initializedRef.current) {
      sampleItems.forEach((item) => {
        const percentage = (item.currentAmount / item.totalAmount) * 100
        if (percentage <= 20) {
          addLowStockNotification(item)
        }
      })
      initializedRef.current = true
    }

    // 自動減少のシミュレーション（デモ用）
    const interval = setInterval(() => {
      setItems((currentItems) =>
        currentItems.map((item) => {
          // デモ用に早めに減少させる
          const newAmount = Math.max(0, item.currentAmount - item.decreaseRate / 20)

          // 残量が20%以下になったらアラート通知を追加
          const oldPercentage = (item.currentAmount / item.totalAmount) * 100
          const newPercentage = (newAmount / item.totalAmount) * 100

          if (oldPercentage > 20 && newPercentage <= 20) {
            addLowStockNotification({ ...item, currentAmount: newAmount })
          }

          return {
            ...item,
            currentAmount: newAmount,
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [addLowStockNotification]) // addLowStockNotificationはuseCallbackでメモ化されているので安全

  const addItem = (newItem) => {
    setItems([...items, { ...newItem, id: items.length + 1 }])
    setShowAddDialog(false)
  }

  // useCallbackを使用してupdateItemAmount関数をメモ化
  const updateItemAmount = useCallback(
    (id, newAmount, newDecreaseRate = null) => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            // 選択されているアイテムが更新対象の場合、selectedItemも更新
            const updatedItem = {
              ...item,
              currentAmount: newAmount,
              ...(newDecreaseRate !== null && { decreaseRate: newDecreaseRate }),
            }

            // 選択中のアイテムを更新
            if (selectedItem && selectedItem.id === id) {
              setSelectedItem(updatedItem)
            }

            return updatedItem
          }
          return item
        }),
      )
    },
    [selectedItem],
  )

  const addToShoppingList = (item) => {
    if (!shoppingList.some((listItem) => listItem.id === item.id)) {
      setShoppingList([...shoppingList, item])
    }
  }

  const removeFromShoppingList = (id) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id))
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowDetailDialog(true)
  }

  const categories = ["すべて", "おむつ", "ケア用品", "食料品", "その他"]
  const [activeCategory, setActiveCategory] = useState("すべて")

  const filteredItems = activeCategory === "すべて" ? items : items.filter((item) => item.category === activeCategory)

  const lowStockItems = items.filter((item) => (item.currentAmount / item.totalAmount) * 100 < 30)

  // 残量に応じたプログレスバーの色を取得する関数
  const getProgressColor = (percentage) => {
    if (percentage <= 20) {
      return "!bg-red-500" // 20%以下: 赤
    } else if (percentage <= 40) {
      return "!bg-orange-500" // 40%以下: オレンジ
    } else if (percentage <= 60) {
      return "!bg-yellow-500" // 60%以下: 黄色
    } else {
      return "!bg-green-500" // それ以上: 緑
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
            </svg>
          </div>
          <h1 className="text-lg font-semibold md:text-xl text-gray-800">在庫管理</h1>
        </div>

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const percentage = (item.currentAmount / item.totalAmount) * 100
              const isLowStock = percentage < 30
              const progressColor = getProgressColor(percentage)
              // 残り日数を計算
              const daysRemaining = Math.round(item.currentAmount / item.decreaseRate)

              return (
                <div
                  key={item.id}
                  className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg flex-shrink-0">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.category}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">{item.category}</p>
                        <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                        {isLowStock && <p className="text-xs text-red-500 mt-1">あと約{daysRemaining}日</p>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{Math.round(percentage)}%</span>
                        {isLowStock && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      </div>
                      <Progress
                        value={percentage}
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
      </main>
      <div className="sticky bottom-0 border-t bg-white p-2">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">ホーム</span>
          </Button>
          <Link href="/shopping-list">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">買い物リスト</span>
              {shoppingList.length > 0 && (
                <span className="absolute top-0 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {shoppingList.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/recommendations">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <ThumbsUp className="h-5 w-5" />
              <span className="text-xs">おすすめ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* フローティング追加ボタン */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button
          className="h-14 w-14 rounded-full bg-pink-400 hover:bg-pink-500 shadow-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddItemDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={addItem} />
      <ItemDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        item={selectedItem}
        updateAmount={updateItemAmount}
        addToShoppingList={addToShoppingList}
      />
    </div>
  )
}
