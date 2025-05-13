"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner"
import { getProductInfo, type ProductInfo } from "@/services/product-service"

interface BarcodeScannerProps {
  onProductFound: (product: ProductInfo) => void
  onCancel: () => void
  onError: () => void
}

export function BarcodeScanner({ onProductFound, onCancel, onError }: BarcodeScannerProps) {
  const { videoRef, result, isScanning, error, startScanning, stopScanning } = useBarcodeScanner()
  const [isLoading, setIsLoading] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  // コンポーネントがマウントされたらスキャンを開始
  useEffect(() => {
    const startScan = async () => {
      try {
        await startScanning()
      } catch (e) {
        if (e instanceof DOMException && e.name === "NotAllowedError") {
          setPermissionDenied(true)
        }
      }
    }

    startScan()

    // クリーンアップ時にスキャンを停止
    return () => {
      stopScanning()
    }
  }, [])

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

  return (
    <div className="relative flex flex-col items-center">
      {permissionDenied ? (
        <div className="p-4 text-center">
          <p className="mb-4 text-red-500">
            カメラへのアクセスが拒否されました。ブラウザの設定からカメラへのアクセスを許可してください。
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
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
            {/* スキャン領域のマーカー */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-32 border-2 border-pink-400 rounded-md"></div>
            </div>

            {/* ビデオプレビュー */}
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {/* ローディング表示 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400"></div>
              </div>
            )}

            {/* 閉じるボタン */}
            <button className="absolute top-2 right-2 z-20 bg-white/80 rounded-full p-1.5" onClick={onCancel}>
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          <p className="text-sm text-center mb-4">バーコードをスキャン領域に合わせてください</p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="rounded-full">
              キャンセル
            </Button>

            <Button
              variant="default"
              onClick={() => {
                stopScanning()
                startScanning()
              }}
              className="rounded-full bg-pink-400 hover:bg-pink-500"
              disabled={isLoading}
            >
              <Camera className="h-4 w-4 mr-2" />
              再スキャン
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
