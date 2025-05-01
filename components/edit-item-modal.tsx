"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useItems } from "@/hooks/use-items"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type { Item } from "@/types/item"

interface EditItemModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
}

export function EditItemModal({ item, isOpen, onClose }: EditItemModalProps) {
  const [qty, setQty] = useState(item.qty)
  const [isLoading, setIsLoading] = useState(false)
  const { updateItem } = useItems()

  useEffect(() => {
    setQty(item.qty)
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await updateItem(item.id, { qty })
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update item. Please try again.",
        })
        return
      }

      toast({
        title: "Success",
        description: "Item updated successfully.",
      })
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const percentage = Math.round((qty / item.max_qty) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
          <DialogDescription>Adjust the quantity of this item in your inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="qty">Quantity</Label>
                <span className="text-sm">
                  {qty} / {item.max_qty} ({percentage}%)
                </span>
              </div>
              <Slider
                id="qty"
                min={0}
                max={item.max_qty}
                step={1}
                value={[qty]}
                onValueChange={(value) => setQty(value[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
