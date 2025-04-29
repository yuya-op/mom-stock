"use client"

import { useState, useCallback } from "react"

export function useNotifications() {
  // 通知の状態を管理
  const [notifications, setNotifications] = useState([])

  // アイテムの在庫が少なくなった時に通知を追加
  const addLowStockNotification = useCallback((item) => {
    const percentage = (item.currentAmount / item.totalAmount) * 100

    setNotifications((prevNotifications) => {
      // 既に同じアイテムの通知がある場合は追加しない
      const existingNotification = prevNotifications.find(
        (notification) => notification.type === "alert" && notification.itemId === item.id && !notification.read,
      )

      if (existingNotification) return prevNotifications

      const newNotification = {
        id: Date.now(),
        type: "alert",
        title: "在庫が少なくなっています",
        message: `${item.name}の残量が${Math.round(percentage)}%になりました。`,
        timestamp: new Date().toISOString(),
        read: false,
        itemId: item.id,
        actionLink: "/dashboard",
        actionText: "在庫を確認する",
      }

      return [newNotification, ...prevNotifications]
    })
  }, [])

  // 通知を既読にする
  const markNotificationAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  // すべての通知を既読にする
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  // 通知を削除する
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  // 通知を追加する（一般的な通知用）
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  return {
    notifications,
    addLowStockNotification,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
  }
}
