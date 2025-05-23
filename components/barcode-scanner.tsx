"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import type Webcam from "react-webcam"
import Quagga from "@ericblade/quagga2"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, X } from "lucide-react"

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isScanActive, setIsScanActive] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const scannerRef = useRef<HTMLDivElement>(null)
  const webcamRef = useRef<Webcam>(null)

  // カメラの切り替え
  const toggleCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user")
  }

  // QuaggaJSの初期化
  const initQuagga = useCallback(() => {
    if (!scannerRef.current) return

    setIsInitializing(true)

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: facingMode,
            width: { min: 640 },
            height: { min: 480 },
            aspectRatio: { min: 1, max: 2 },
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        frequency: 10,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_39_reader", "code_128_reader"],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Error initializing Quagga:", err)
          setHasPermission(false)
          setIsInitializing(false)
          return
        }

        setHasPermission(true)
        setIsInitializing(false)
        setIsScanActive(true)
        Quagga.start()
      },
    )

    // 結果の信頼性を確保するための変数
    let lastCode = ""
    let sameCodeCount = 0

    // バーコード検出時のコールバック
    Quagga.onDetected((result) => {
      if (result && result.codeResult && result.codeResult.code) {
        const code = result.codeResult.code

        // 同じコードが連続で検出された場合のみ有効とする（ノイズ対策）
        if (code === lastCode) {
          sameCodeCount++

          // 同じコードが3回連続で検出されたら信頼性が高いと判断
          if (sameCodeCount >= 3) {
            console.log("Barcode detected with high confidence:", code)

            // 検出したバーコードを親コンポーネントに通知
            onDetected(code)

            // スキャンを停止
            stopScanner()

            // カウンターをリセット
            sameCodeCount = 0
          }
        } else {
          // 新しいコードが検出されたらカウンターをリセット
          lastCode = code
          sameCodeCount = 1
        }
      }
    })

    return () => {
      stopScanner()
    }
  }, [facingMode, onDetected])

  // スキャナーの停止
  const stopScanner = () => {
    if (isScanActive) {
      Quagga.stop()
      setIsScanActive(false)
    }
  }

  // コンポーネントのマウント時にQuaggaを初期化
  useEffect(() => {
    initQuagga()

    return () => {
      stopScanner()
    }
  }, [initQuagga])

  // カメラの向きが変わったときに再初期化
  useEffect(() => {
    if (isScanActive) {
      stopScanner()
      initQuagga()
    }
  }, [facingMode, initQuagga])

  // カメラのアクセス許可がない場合
  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex justify-between">
            <h3 className="text-lg font-medium text-gray-900">カメラへのアクセスが必要です</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-4 text-gray-600">
            バーコードをスキャンするには、カメラへのアクセス許可が必要です。ブラウザの設定からカメラへのアクセスを許可してください。
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={() => window.location.reload()}>再試行</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium text-gray-900">バーコードスキャン</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          {/* スキャナーのビューファインダー */}
          <div ref={scannerRef} className="w-full h-64 md:h-80 bg-gray-100 overflow-hidden relative">
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                <span className="ml-2 text-gray-600">カメラ初期化中...</span>
              </div>
            )}

            {/* スキャンガイド */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-pink-400 rounded-lg"></div>
            </div>
          </div>

          {/* コントロールパネル */}
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-4 text-center">バーコードをスキャン枠内に合わせてください</p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleCamera} className="rounded-full">
                <Camera className="h-4 w-4 mr-1" />
                カメラ切替
              </Button>
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-full">
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
