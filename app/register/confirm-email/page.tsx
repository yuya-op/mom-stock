"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"

export default function ConfirmEmail() {
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // URLからメールアドレスを取得
  const emailFromUrl = searchParams?.get("email") || ""

  const handleResendConfirmation = async () => {
    if (!email && !emailFromUrl) {
      setError("メールアドレスを入力してください")
      return
    }

    setIsResending(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email || emailFromUrl,
      })

      if (error) {
        setError(`確認メールの再送信に失敗しました: ${error.message}`)
      } else {
        setResendSuccess(true)
      }
    } catch (err) {
      setError("確認メールの再送信中にエラーが発生しました")
      console.error(err)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 mr-2">
                <Image src="/app-icon.png" alt="mom-stockアイコン" width={40} height={40} className="rounded-md" />
              </div>
              <span className="text-2xl font-bold text-gray-800">mom-stock</span>
            </div>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-pink-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">メールを確認してください</h1>
          <p className="text-gray-600 mb-6">
            登録を完了するために、お送りしたメールのリンクをクリックしてください。
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>

          {!resendSuccess ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder={emailFromUrl || "メールアドレスを入力"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Button
                onClick={handleResendConfirmation}
                className="w-full bg-pink-400 hover:bg-pink-500 rounded-lg"
                disabled={isResending}
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    送信中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    確認メールを再送信
                  </span>
                )}
              </Button>

              <Link href="/login">
                <Button variant="outline" className="w-full rounded-lg border-gray-200">
                  ログインページへ
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                確認メールを再送信しました。メールボックスをご確認ください。
              </div>

              <Link href="/login">
                <Button className="w-full bg-pink-400 hover:bg-pink-500 rounded-lg">ログインページへ</Button>
              </Link>
            </div>
          )}

          <div className="mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-pink-500 flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              ホームに戻る
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            問題がありましたか？{" "}
            <Link href="/contact" className="text-pink-500 hover:underline">
              お問い合わせ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
