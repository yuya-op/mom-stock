"use client"

import { useState, useEffect } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Item } from "@/types/item"
import { useAuth } from "@/contexts/auth-context"

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabase> | null>(null)

  useEffect(() => {
    // Initialize Supabase client on the client side
    try {
      const supabaseClient = getSupabase()
      setSupabase(supabaseClient)
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      setIsLoading(false)
      setError(error as Error)
    }
  }, [])

  useEffect(() => {
    if (!user || !supabase) {
      setItems([])
      setIsLoading(false)
      return
    }

    const fetchItems = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setItems(data || [])
      } catch (error) {
        console.error("Error fetching items:", error)
        setError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()

    // リアルタイム更新をリッスン
    const subscription = supabase
      .channel("items_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((prev) => [payload.new as Item, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) => prev.map((item) => (item.id === payload.new.id ? (payload.new as Item) : item)))
          } else if (payload.eventType === "DELETE") {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase])

  const addItem = async (name: string, barcode: string, qty: number, max_qty: number) => {
    if (!user || !supabase) return { error: new Error("User not authenticated or Supabase not initialized") }

    try {
      const { data, error } = await supabase
        .from("items")
        .insert([{ name, barcode, qty, max_qty, user_id: user.id }])
        .select()

      if (error) {
        throw error
      }

      return { data }
    } catch (error) {
      console.error("Error adding item:", error)
      return { error }
    }
  }

  const updateItem = async (id: string, updates: Partial<Item>) => {
    if (!supabase) return { error: new Error("Supabase not initialized") }

    try {
      const { data, error } = await supabase.from("items").update(updates).eq("id", id).select()

      if (error) {
        throw error
      }

      return { data }
    } catch (error) {
      console.error("Error updating item:", error)
      return { error }
    }
  }

  const deleteItem = async (id: string) => {
    if (!supabase) return { error: new Error("Supabase not initialized") }

    try {
      const { error } = await supabase.from("items").delete().eq("id", id)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting item:", error)
      return { error }
    }
  }

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
  }
}
