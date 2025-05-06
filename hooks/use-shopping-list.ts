"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export interface ShoppingListItem {
  id: string
  item_id: number
  name: string
  category: string
  currentAmount: number
  totalAmount: number
  decrease_rate: number
  imageUrl: string | null
  purchaseUrl: string
}

export function useShoppingList() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // 買い物リストを取得
  const fetchShoppingList = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setShoppingList([])
        return
      }

      const { data, error } = await supabase
        .from("shopping_list_items")
        .select(`
          id,
          item_id,
          items (
            id,
            name,
            category,
            "currentAmount",
            "totalAmount",
            "decrease_rate",
            "imageUrl",
            "purchaseUrl"
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // データを整形
      const formattedData =
        data?.map((item) => ({
          id: item.id,
          item_id: item.items.id,
          name: item.items.name,
          category: item.items.category,
          currentAmount: item.items.currentAmount,
          totalAmount: item.items.totalAmount,
          decrease_rate: item.items.decrease_rate,
          imageUrl: item.items.imageUrl,
          purchaseUrl: item.items.purchaseUrl,
        })) || []

      setShoppingList(formattedData)
    } catch (err) {
      console.error("Error fetching shopping list:", err)
      setError("買い物リストの取得中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初回マウント時に買い物リストを取得
  useEffect(() => {
    fetchShoppingList()
  }, [fetchShoppingList])

  // 買い物リストにアイテムを追加
  const addToShoppingList = useCallback(
    async (itemId: number) => {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          toast({
            title: "エラー",
            description: "ログインが必要です",
            variant: "destructive",
          })
          return false
        }

        const { error } = await supabase.from("shopping_list_items").upsert({
          user_id: session.session.user.id,
          item_id: itemId,
        })

        if (error) throw error

        toast({
          title: "追加完了",
          description: "買い物リストに追加しました",
        })

        // リストを再取得
        await fetchShoppingList()
        return true
      } catch (err) {
        console.error("Error adding to shopping list:", err)
        toast({
          title: "エラー",
          description: "買い物リストへの追加に失敗しました",
          variant: "destructive",
        })
        return false
      }
    },
    [fetchShoppingList, toast],
  )

  // 買い物リストからアイテムを削除
  const removeFromShoppingList = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("shopping_list_items").delete().eq("id", id)

        if (error) throw error

        // UIを更新
        setShoppingList((prev) => prev.filter((item) => item.id !== id))

        toast({
          title: "削除完了",
          description: "買い物リストから削除しました",
        })

        return true
      } catch (err) {
        console.error("Error removing from shopping list:", err)
        toast({
          title: "エラー",
          description: "買い物リストからの削除に失敗しました",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  // アイテムを購入済みとしてマーク
  const purchaseItem = useCallback(
    async (shoppingItemId: string, itemId: number, totalAmount: number, price = 0) => {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          toast({
            title: "エラー",
            description: "ログインが必要です",
            variant: "destructive",
          })
          return false
        }

        // 現在の日時を購入日時として使用
        const purchaseDate = new Date().toISOString()

        // 1. 購入履歴に追加
        const { error: historyError } = await supabase.from("purchase_history").insert({
          user_id: session.session.user.id,
          item_id: itemId,
          qty: 1,
          price: price,
          purchased_at: purchaseDate, // 購入ボタンを押した時点の日時を使用
        })

        if (historyError) {
          console.error("Error adding purchase history:", historyError)
          // 履歴追加に失敗しても続行
        }

        // 2. アイテムの在庫を更新 (days_remaining をリセット)
        const { error: updateError } = await supabase.from("items").update({ days_remaining: 120 }).eq("id", itemId)

        // days_remaining カラムがない場合は旧スキーマを使用
        if (updateError && updateError.message.includes("days_remaining")) {
          const { error: oldSchemaError } = await supabase
            .from("items")
            .update({ currentAmount: totalAmount })
            .eq("id", itemId)

          if (oldSchemaError) throw oldSchemaError
        } else if (updateError) {
          throw updateError
        }

        // 3. 買い物リストから削除
        const { error: deleteError } = await supabase.from("shopping_list_items").delete().eq("id", shoppingItemId)

        if (deleteError) throw deleteError

        // UIを更新
        setShoppingList((prev) => prev.filter((item) => item.id !== shoppingItemId))

        toast({
          title: "購入完了",
          description: "在庫を補充し、購入履歴に記録しました",
        })

        return true
      } catch (err) {
        console.error("Error purchasing item:", err)
        toast({
          title: "エラー",
          description: "購入処理に失敗しました",
          variant: "destructive",
        })
        return false
      }
    },
    [toast, supabase],
  )

  return {
    shoppingList,
    isLoading,
    error,
    fetchShoppingList,
    addToShoppingList,
    removeFromShoppingList,
    purchaseItem,
  }
}
