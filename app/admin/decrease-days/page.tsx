"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function DecreaseDaysPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDecreaseDays = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/decrease-days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 本番環境では、より安全な認証方法を使用する
          "x-api-key": "your-secret-api-key",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred")
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error decreasing days:", err)
      setError(err.message || "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Link href="/dashboard" className="text-pink-500 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          ダッシュボードに戻る
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">残り日数の減少処理</h1>
        <p className="text-gray-600 mb-6">
          このページでは、すべてのアイテムの残り日数を1日減らす処理を手動で実行できます。
          通常、この処理は毎日0時に自動的に実行されます。
        </p>

        <Button onClick={handleDecreaseDays} className="bg-pink-400 hover:bg-pink-500 rounded-lg" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              処理中...
            </span>
          ) : (
            "残り日数を1日減らす"
          )}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p className="font-medium">エラーが発生しました：</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-800 mb-2">処理結果</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="mb-2">
                <span className="font-medium">処理完了メッセージ：</span> {result.message}
              </p>
              <p className="mb-2">
                <span className="font-medium">処理されたアイテム数：</span> {result.processed}
              </p>
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">詳細結果：</h3>
                <div className="max-h-60 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          旧残り日数
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          新残り日数
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          結果
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.results.map((item: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.oldDays}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.newDays}</td>
                          <td className="px-4 py-2 text-sm">
                            {item.success ? (
                              <span className="text-green-500">成功</span>
                            ) : (
                              <span className="text-red-500">{item.error || "失敗"}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
