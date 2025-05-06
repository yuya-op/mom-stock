"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"

export default function ConfirmEmail() {
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

          <div className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-pink-400 hover:bg-pink-500 rounded-lg">ログインページへ</Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full rounded-lg border-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
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
