"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Item } from "@/types/item"
import { useToast } from "@/hooks/use-toast"

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch all items for the current user
  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setItems([])
        return
      }

      const { data, error } = await supabase.from("items").select("*").order("days_remaining")

      if (error) throw error

      // Ensure all items have days_remaining set
      const validatedData =
        data?.map((item) => ({
          ...item,
          days_remaining: item.days_remaining || 30,
        })) || []

      setItems(validatedData)
    } catch (err) {
      console.error("Error fetching items:", err)
      setError("アイテムの取得中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update days_remaining for an item
  const updateDaysRemaining = useCallback(
    async (id: number, days: number) => {
      try {
        console.log(`Updating item ${id} with days_remaining: ${days}`)

        // 古いスキーマのフィールドを更新
        const updateData = {
          currentAmount: (days / 30) * 100,
          totalAmount: 100,
          decrease_rate: 100 / 30, // Rate to empty in 30 days
        }

        // Supabaseに更新リクエストを送信
        const { data, error: updateError } = await supabase.from("items").update(updateData).eq("id", id).select()

        if (updateError) {
          console.error("Error updating item in Supabase:", updateError)
          throw updateError
        }

        console.log("Supabase update response:", data)

        // UI を更新
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (item.id === id) {
              console.log(`Updating local item ${id} from ${item.days_remaining} to ${days} days`)
              return {
                ...item,
                days_remaining: days,
                currentAmount: updateData.currentAmount,
                totalAmount: updateData.totalAmount,
                decrease_rate: updateData.decrease_rate,
              }
            }
            return item
          }),
        )

        return true
      } catch (err) {
        console.error("Error updating days remaining:", err)
        toast({
          title: "エラー",
          description: "残り日数の更新に失敗しました",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  // Add a new item
  const addItem = useCallback(
    async (item: Omit<Item, "id" | "user_id" | "last_updated">) => {
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

        const { error } = await supabase.from("items").insert([
          {
            ...item,
            user_id: session.session.user.id,
            consumption_days: item.consumption_days || 30, // デフォルト値を設定
            stock_count: item.stock_count || 1, // デフォルト値を設定
          },
        ])

        if (error) throw error

        // Refresh items
        await fetchItems()
        return true
      } catch (err) {
        console.error("Error adding item:", err)
        toast({
          title: "エラー",
          description: "アイテムの追加に失敗しました",
          variant: "destructive",
        })
        return false
      }
    },
    [fetchItems, toast],
  )

  // Delete an item
  const deleteItem = useCallback(
    async (id: number) => {
      try {
        const { error } = await supabase.from("items").delete().eq("id", id)

        if (error) throw error

        // Update local state
        setItems((prev) => prev.filter((item) => item.id !== id))
        return true
      } catch (err) {
        console.error("Error deleting item:", err)
        toast({
          title: "エラー",
          description: "アイテムの削除に失敗しました",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  // Reset days_remaining to 30 (purchase completed)
  const resetDaysRemaining = useCallback(
    async (id: number) => {
      return updateDaysRemaining(id, 30)
    },
    [updateDaysRemaining],
  )

  // Update item info including consumption_days and stock_count
  const updateItemInfo = useCallback(
    async (id: number, days: number, consumptionDays: number, stockCount: number) => {
      // 残り日数を更新
      const success = await updateDaysRemaining(id, days)

      if (success) {
        // ローカルストレージに消費日数と在庫数を保存
        try {
          const storageKey = `item_${id}_metadata`
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
      }

      return success
    },
    [updateDaysRemaining],
  )

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    isLoading,
    error,
    fetchItems,
    updateDaysRemaining,
    resetDaysRemaining,
    addItem,
    deleteItem,
    updateItemInfo,
  }
}
