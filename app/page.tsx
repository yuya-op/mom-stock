"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useItems } from "@/hooks/use-items"
import { Button } from "@/components/ui/button"
import type { Item } from "@/types/item"
import { ItemCard } from "@/components/item-card"
import { AddItemModal } from "@/components/add-item-modal"
import { EditItemModal } from "@/components/edit-item-modal"
import { Loader2, LogOut, Plus } from "lucide-react"

export default function Home() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const { items, isLoading: itemsLoading } = useItems()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, user, router])

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/signin")
  }

  if (authLoading || itemsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="mb-6 flex justify-between">
          <h2 className="text-xl font-semibold">Your Items</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-gray-500">No items yet. Add your first item to get started.</p>
            <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onEdit={handleEditItem} />
            ))}
          </div>
        )}
      </div>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {editingItem && <EditItemModal item={editingItem} isOpen={!!editingItem} onClose={() => setEditingItem(null)} />}
    </div>
  )
}
