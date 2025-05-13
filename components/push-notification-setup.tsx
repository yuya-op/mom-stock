"use client"

import { useEffect } from "react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Capacitor } from "@capacitor/core"
import { supabase } from "@/lib/supabase"

export function PushNotificationSetup() {
  const { token, error, hasPermission } = usePushNotifications()

  // トークンが取得できたらSupabaseに保存
  useEffect(() => {
    const saveTokenToSupabase = async () => {
      if (token && Capacitor.isNativePlatform()) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // ユーザーのプッシュ通知トークンを保存
            const { error } = await supabase.from("user_push_tokens").upsert(
              {
                user_id: user.id,
                push_token: token,
                device_type: Capacitor.getPlatform(),
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "user_id",
              },
            )

            if (error) {
              console.error("トークン保存エラー:", error)
            }
          }
        } catch (e) {
          console.error("トークン保存中のエラー:", e)
        }
      }
    }

    saveTokenToSupabase()
  }, [token])

  // Webブラウザでは何も表示しない
  if (!Capacitor.isNativePlatform()) {
    return null
  }

  return null // UIは表示せず、バックグラウンドで動作
}
