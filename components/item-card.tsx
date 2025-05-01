"use client"

import type { Item } from "@/types/item"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Edit, Trash2 } from "lucide-react"
import { useItems } from "@/hooks/use-items"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ItemCardProps {
  item: Item
  onEdit: (item: Item) => void
}

export function ItemCard({ item, onEdit }: ItemCardProps) {
  const { deleteItem } = useItems()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const percentage = Math.round((item.qty / item.max_qty) * 100)

  const handleDelete = async () => {
    await deleteItem(item.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{item.name}</span>
            <span className="text-sm font-normal text-gray-500">
              {item.qty} / {item.max_qty}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-1 flex justify-between text-sm">
            <span>Quantity</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          {item.barcode && <p className="mt-4 text-sm text-gray-500">Barcode: {item.barcode}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {item.name} from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
