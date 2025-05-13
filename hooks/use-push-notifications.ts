"use client"

import { useEffect, useState } from "react"
import { PushNotifications } from "@capacitor/push-notifications"
import { Capacitor } from "@capacitor/core"

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      registerPushNotifications()
    }
  }, [])

  const registerPushNotifications = async () => {
    try {
      // パーミッションをリクエスト
      const permissionStatus = await PushNotifications.requestPermissions()

      if (permissionStatus.receive === "granted") {
        setHasPermission(true)

        // 通知を登録
        await PushNotifications.register()

        // イベントリスナーを設定
        setupListeners()
      } else {
        setHasPermission(false)
        setError("プッシュ通知の許可が得られませんでした")
      }
    } catch (e) {
      console.error("プッシュ通知の初期化エラー:", e)
      setError("プッシュ通知の初期化中にエラーが発生しました")
    }
  }

  const setupListeners = () => {
    // トークン取得時
    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token: " + token.value)
      setToken(token.value)
    })

    // 登録エラー時
    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration failed: " + JSON.stringify(err))
      setError("プッシュ通知の登録に失敗しました")
    })

    // 通知受信時
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push notification received: " + JSON.stringify(notification))
      setNotifications((prevNotifications) => [...prevNotifications, notification])
    })

    // 通知タップ時
    PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.log("Push notification action performed: " + JSON.stringify(notification))
    })
  }

  return {
    token,
    notifications,
    hasPermission,
    error,
  }
}
