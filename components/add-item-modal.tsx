"use client"

import type React from "react"

import { useState } from "react"
import { useItems } from "@/hooks/use-items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [name, setName] = useState("")
  const [barcode, setBarcode] = useState("")
  const [qty, setQty] = useState(0)
  const [maxQty, setMaxQty] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useItems()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await addItem(name, barcode, qty, maxQty)
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add item. Please try again.",
        })
        return
      }

      toast({
        title: "Success",
        description: "Item added successfully.",
      })
      resetForm()
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

  const resetForm = () => {
    setName("")
    setBarcode("")
    setQty(0)
    setMaxQty(100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>Add a new item to your inventory. Fill out the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <Input id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qty">Current Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxQty">Maximum Quantity</Label>
                <Input
                  id="maxQty"
                  type="number"
                  min="1"
                  value={maxQty}
                  onChange={(e) => setMaxQty(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
