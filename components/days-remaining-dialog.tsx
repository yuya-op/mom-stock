"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function DaysRemainingDialog({ open, onClose, onConfirm, item }) {
  const [daysRemaining, setDaysRemaining] = useState(30)
  const MAX_DAYS = 30

  useEffect(() => {
    if (item && open) {
      setDaysRemaining(item.days_remaining || 30)
    }
  }, [item, open])

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Calendar className="h-5 w-5 text-pink-400" />
            残り日数の調整
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">{item.name}の残り日数を設定します。</p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-2 bg-gray-200 rounded-lg"></div>
                  <div
                    className="absolute top-0 left-0 h-2 bg-pink-200 rounded-lg"
                    style={{ width: `${((daysRemaining - 1) / (MAX_DAYS - 1)) * 100}%` }}
                  ></div>
                  <div
                    className="absolute -top-1 h-4 w-4 bg-pink-400 rounded-full border-2 border-white shadow cursor-pointer"
                    style={{
                      left: `${((daysRemaining - 1) / (MAX_DAYS - 1)) * 100}%`,
                      transform: "translateX(-50%)",
                    }}
                    onMouseDown={(e) => {
                      const handleMouseMove = (moveEvent) => {
                        const slider = e.target.parentElement
                        const rect = slider.getBoundingClientRect()
                        const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
                        const newValue = Math.round(percent * (MAX_DAYS - 1)) + 1
                        setDaysRemaining(newValue)
                      }

                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }

                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>1日</span>
                  <span>{MAX_DAYS}日</span>
                </div>
              </div>
              <div className="w-16 text-center font-medium text-lg">{daysRemaining}日</div>
            </div>

            <div className="text-xs text-gray-500">
              この設定により、{item.name}の残り日数は{daysRemaining}日に設定されます。
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            キャンセル
          </Button>
          <Button
            onClick={() => onConfirm(daysRemaining)}
            className="flex-1 bg-pink-400 hover:bg-pink-500 rounded-full"
          >
            設定する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
