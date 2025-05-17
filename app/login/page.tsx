"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShowResendConfirmation(false)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError("メールアドレスの確認が完了していません。確認メールをご確認ください。")
          setShowResendConfirmation(true)
        } else if (error.message.includes("Invalid login credentials")) {
          setError("メールアドレスまたはパスワードが正しくありません")
        } else {
          setError(error.message)
        }
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("ログイン中に予期せぬエラーが発生しました")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setResendLoading(true)
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        setError(`確認メールの再送信に失敗しました: ${error.message}`)
      } else {
        setResendSuccess(true)
        setError(null)
      }
    } catch (err) {
      setError("確認メールの再送信中にエラーが発生しました")
      console.error(err)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-pink-50 flex items-center justify-center p-8">
        <div className="flex justify-center items-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            <div className="absolute inset-0 rounded-full border-4 border-pink-200 overflow-hidden bg-white">
              <Image
                src="/mother-baby-illustration.png"
                alt="母親と赤ちゃんのイラスト"
                fill
                className="object-contain scale-110"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center">
                <div className="h-8 w-8 mr-2">
                  <Image src="/app-icon.png" alt="mom-stockアイコン" width={32} height={32} className="rounded-md" />
                </div>
                <span className="text-xl font-bold text-gray-800">mom-stock</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">おかえりなさい</h1>
            <p className="text-gray-500 text-sm">アカウントにログインしてください</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border-gray-200"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="/forgot-password" className="text-xs text-pink-500 hover:underline">
                  パスワードをお忘れですか？
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-lg border-gray-200 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {showResendConfirmation && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">メール確認が必要です</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      登録時に送信された確認メールのリンクをクリックして、アカウントを有効化してください。
                    </p>
                    {!resendSuccess ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                      >
                        {resendLoading ? "送信中..." : "確認メールを再送信する"}
                      </Button>
                    ) : (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ 確認メールを再送信しました。メールボックスをご確認ください。
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-pink-400 hover:bg-pink-500 rounded-lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  ログイン中...
                </span>
              ) : (
                "ログイン"
              )}
            </Button>
          </form>
          <div className="text-center text-sm">
            <p className="text-gray-500">
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-pink-500 hover:underline">
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
