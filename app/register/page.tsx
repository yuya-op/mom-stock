"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)

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
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">姓</Label>
                <Input id="first-name" placeholder="山田" required className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">名</Label>
                <Input id="last-name" placeholder="花子" required className="rounded-lg border-gray-200" />
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">8文字以上で、数字と記号を含めてください</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
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
            <Button type="submit" className="w-full bg-pink-400 hover:bg-pink-500 rounded-lg">
              登録する
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
