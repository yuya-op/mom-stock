"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!firstName || !lastName || !email || !password) {
      setError("すべての項目を入力してください")
      return
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください")
      return
    }

    if (!agreedToTerms) {
      setError("利用規約とプライバシーポリシーに同意してください")
      return
    }

    // 既に処理中の場合は何もしない
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Supabaseでユーザー登録
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // 登録成功
      if (data.user) {
        // ダッシュボードにリダイレクト
        router.push("/dashboard")
      } else {
        // メール確認が必要な場合
        router.push("/register/confirm-email")
      }
    } catch (err: any) {
      console.error("Registration error:", err)

      // エラーメッセージの日本語化
      if (err.message.includes("already registered")) {
        setError("このメールアドレスは既に登録されています")
      } else if (err.message.includes("password")) {
        setError("パスワードが要件を満たしていません")
      } else if (err.message.includes("security purposes") || err.message.includes("request this after")) {
        setError("セキュリティ上の理由により、しばらく待ってから再度お試しください")
      } else {
        setError("登録中にエラーが発生しました。もう一度お試しください")
      }
    } finally {
      setIsLoading(false)
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
            <h1 className="text-2xl font-bold text-gray-800">アカウント作成</h1>
            <p className="text-gray-500 text-sm">必要事項を入力して登録してください</p>
          </div>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">姓</Label>
                <Input
                  id="first-name"
                  placeholder="山田"
                  required
                  className="rounded-lg border-gray-200"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">名</Label>
                <Input
                  id="last-name"
                  placeholder="花子"
                  required
                  className="rounded-lg border-gray-200"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                required
                className="rounded-lg border-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="rounded-lg border-gray-200 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className="text-xs text-gray-500">8文字以上で、数字と記号を含めてください</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span>
                  <Link href="/terms" className="text-pink-500 hover:underline">
                    利用規約
                  </Link>
                  と
                  <Link href="/privacy" className="text-pink-500 hover:underline">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
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
                  登録中...
                </span>
              ) : (
                "登録する"
              )}
            </Button>
          </form>
          <div className="text-center text-sm">
            <p className="text-gray-500">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-pink-500 hover:underline">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
