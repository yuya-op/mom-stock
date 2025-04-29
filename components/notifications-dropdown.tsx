"use client"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, ShoppingBag, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function NotificationsDropdown({ notifications, markAllAsRead }) {
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full border-gray-200 bg-white text-gray-600">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">通知</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>通知</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={markAllAsRead}>
              すべて既読にする
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">通知はありません</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 focus:bg-gray-50">
              <div className="flex w-full items-start gap-2">
                <div className={`mt-0.5 rounded-full p-1 ${getNotificationIconBg(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.timestamp), { locale: ja, addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  {notification.actionLink && (
                    <Link href={notification.actionLink} className="mt-1 text-xs text-pink-500 hover:underline">
                      {notification.actionText || "詳細を見る"}
                    </Link>
                  )}
                </div>
                {!notification.read && <div className="h-2 w-2 rounded-full bg-pink-500" />}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getNotificationIcon(type) {
  switch (type) {
    case "alert":
      return <AlertTriangle className="h-3 w-3 text-white" />
    case "shopping":
      return <ShoppingBag className="h-3 w-3 text-white" />
    default:
      return <Bell className="h-3 w-3 text-white" />
  }
}

function getNotificationIconBg(type) {
  switch (type) {
    case "alert":
      return "bg-red-500"
    case "shopping":
      return "bg-green-500"
    default:
      return "bg-blue-500"
  }
}
