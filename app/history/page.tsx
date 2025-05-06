"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { format, formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ShoppingBag, BarChart2, Loader2, Calendar, JapaneseYenIcon as Yen } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getCategoryImage } from "@/utils/get-category-image"
import { useShoppingList } from "@/hooks/use-shopping-list"
import { useToast } from "@/hooks/use-toast"

interface PurchaseDetail {
  id: string
  item_id: string
  item: {
    name: string
    category: string
    imageUrl: string | null
  }
  qty: number
  price: number
  purchased_at: string
}

export default function HistoryPage() {
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { shoppingList } = useShoppingList()
  const router = useRouter()
  const { toast } = useToast()

  // 購入履歴データの取得
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      setIsLoading(true)
      setError(null)

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

        // 購入履歴詳細を取得
        const { data: detailsData, error: detailsError } = await supabase
          .from("purchase_history")
          .select(`
            id,
            item_id,
            item:item_id (
              name,
              category,
              imageUrl
            ),
            qty,
            price,
            purchased_at
          `)
          .eq("user_id", session.user.id)
          .order("purchased_at", { ascending: false })
          .limit(50)

        if (detailsError) {
          throw detailsError
        }

        setPurchaseDetails(detailsData || [])
      } catch (err) {
        console.error("Error fetching purchase history:", err)
        setError("購入履歴の取得中にエラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [router])

  // 合計支出額を計算
  const totalSpent = purchaseDetails.reduce((sum, item) => sum + item.price, 0)

  // 月別の支出を計算
  const currentMonth = new Date().getMonth()
  const currentMonthSpent = purchaseDetails
    .filter((item) => new Date(item.purchased_at).getMonth() === currentMonth)
    .reduce((sum, item) => sum + item.price, 0)

  // カテゴリ別の支出を計算
  const categorySpending = purchaseDetails.reduce(
    (acc, item) => {
      const category = item.item.category
      acc[category] = (acc[category] || 0) + item.price
      return acc
    },
    {} as Record<string, number>,
  )

  // 最も支出が多いカテゴリを取得
  let topCategory = { name: "", amount: 0 }
  Object.entries(categorySpending).forEach(([category, amount]) => {
    if (amount > topCategory.amount) {
      topCategory = { name: category, amount }
    }
  })

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
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-pink-50 p-2 rounded-full">
            <BarChart2 className="h-5 w-5 text-pink-400" />
          </div>
          <h1 className="text-lg font-semibold md:text-xl text-gray-800">購入履歴</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400 mb-4" />
            <p className="text-gray-500">データを読み込み中...</p>
          </div>
        ) : (
          <>
            {/* 支出サマリーカード */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">合計支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Yen className="mr-2 h-5 w-5 text-pink-400" />
                    <span className="text-2xl font-bold">{totalSpent.toLocaleString()}</span>
                    <span className="ml-1 text-gray-500">円</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {purchaseDetails.length}回の購入 • 平均:{" "}
                    {Math.round(totalSpent / purchaseDetails.length).toLocaleString()}円/回
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">今月の支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-pink-400" />
                    <span className="text-2xl font-bold">{currentMonthSpent.toLocaleString()}</span>
                    <span className="ml-1 text-gray-500">円</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(), "yyyy年M月")}の支出合計</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">最も支出が多いカテゴリ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-pink-500 font-bold">#{topCategory.name.charAt(0)}</span>
                    </div>
                    <span className="text-xl font-bold">{topCategory.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    合計: {topCategory.amount.toLocaleString()}円 • 全体の
                    {Math.round((topCategory.amount / totalSpent) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 購入履歴リスト */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">購入履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {purchaseDetails.length > 0 ? (
                  <div className="space-y-4">
                    {purchaseDetails.map((purchase) => (
                      <div key={purchase.id} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg flex-shrink-0 bg-gray-100">
                          <Image
                            src={getCategoryImage(purchase.item.category, purchase.item.imageUrl) || "/placeholder.svg"}
                            alt={purchase.item.category}
                            width={48}
                            height={48}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{purchase.item.name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2">{format(new Date(purchase.purchased_at), "yyyy/MM/dd")}</span>
                            <span className="mr-2">{purchase.item.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-pink-500">{purchase.price.toLocaleString()}円</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(purchase.purchased_at), { locale: ja, addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <p>購入履歴がありません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <div className="sticky bottom-0 border-t bg-white p-2">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2 text-gray-600 hover:text-gray-800"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">ホーム</span>
            </Button>
          </Link>
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
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-pink-500">
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs">履歴 / 分析</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
