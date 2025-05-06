"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  isDeleting: boolean
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, itemName, isDeleting }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-red-100 bg-red-50/80">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            アイテムの削除
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700 mb-2">
            <span className="font-medium">{itemName}</span> を削除してもよろしいですか？
          </p>
          <p className="text-sm text-gray-500">
            この操作は取り消せません。アイテムに関連するすべてのデータが削除されます。
          </p>
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 rounded-full" disabled={isDeleting}>
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                削除中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                削除する
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
