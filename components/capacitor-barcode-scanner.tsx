"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useCapacitorBarcodeScanner } from "@/hooks/use-capacitor-barcode-scanner"
import { getProductInfo, type ProductInfo } from "@/services/product-service"
import { Capacitor } from "@capacitor/core"

interface BarcodeScannerProps {
  onProductFound: (product: ProductInfo) => void
  onCancel: () => void
  onError: () => void
}

export function CapacitorBarcodeScanner({ onProductFound, onCancel, onError }: BarcodeScannerProps) {
  const { result, isScanning, error, hasPermission, startScan, stopScan } = useCapacitorBarcodeScanner()
  const [isLoading, setIsLoading] = useState(false)

  // バーコード検出時に商品情報を取得
  useEffect(() => {
    const fetchProductInfo = async () => {
      if (result) {
        setIsLoading(true)
        const productInfo = await getProductInfo(result)
        setIsLoading(false)

        if (productInfo) {
          onProductFound(productInfo)
        } else {
          // 商品情報が見つからない場合
          onError()
        }
      }
    }

    fetchProductInfo()
  }, [result, onProductFound, onError])

  // スキャン中はUIを非表示にする
  if (isScanning && Capacitor.isNativePlatform()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <Button
          variant="outline"
          onClick={stopScan}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white/80 rounded-full"
        >
          キャンセル
        </Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center p-4">
      {!hasPermission && Capacitor.isNativePlatform() ? (
        <div className="p-4 text-center">
          <p className="mb-4 text-red-500">
            カメラへのアクセスが拒否されました。設定からカメラへのアクセスを許可してください。
          </p>
          <Button variant="outline" onClick={onCancel}>
            手動入力に切り替え
          </Button>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Button variant="outline" onClick={onCancel}>
            手動入力に切り替え
          </Button>
        </div>
      ) : (
        <>
          <div className="w-full aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>

          <p className="text-sm text-center mb-6">
            「スキャン開始」ボタンをタップして、バーコードをスキャンしてください
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-400"></div>
              <span className="ml-2">商品情報を取得中...</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="rounded-full">
                キャンセル
              </Button>

              <Button
                variant="default"
                onClick={startScan}
                className="rounded-full bg-pink-400 hover:bg-pink-500"
                disabled={isLoading}
              >
                <Camera className="h-4 w-4 mr-2" />
                スキャン開始
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
