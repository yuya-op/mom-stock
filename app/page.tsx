import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="#">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2">
              <Image src="/app-icon.png" alt="mom-stockアイコン" width={32} height={32} className="rounded-md" />
            </div>
            <span className="text-xl font-bold text-gray-800">mom-stock</span>
          </div>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium text-gray-600 hover:text-pink-500 hover:underline underline-offset-4"
            href="/login"
          >
            ログイン
          </Link>
          <Link
            className="text-sm font-medium text-gray-600 hover:text-pink-500 hover:underline underline-offset-4"
            href="/register"
          >
            新規登録
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-800">
              育児ママの味方、mom-stock
            </h1>
            <p className="text-gray-600 md:text-lg">
              おむつや綿棒、ローションなどの在庫管理をスマートに。買い忘れの心配なく、育児に集中できます。
            </p>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button className="bg-pink-400 hover:bg-pink-500 rounded-full shadow-sm">
                  今すぐ始める
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 flex justify-center items-center">
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <div className="absolute inset-0 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden">
              <div className="relative w-56 h-56 md:w-64 md:h-64">
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
      </main>
      <footer className="border-t py-6 px-4 md:px-6 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">© 2024 mom-stock. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-xs text-gray-500 hover:text-pink-500">
              プライバシーポリシー
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-pink-500">
              利用規約
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-pink-500">
              お問い合わせ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
