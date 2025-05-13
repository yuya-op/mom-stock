"use client"

import { useState, useEffect } from "react"
import { BarcodeScanner } from "@capacitor-community/barcode-scanner"
import { Capacitor } from "@capacitor/core"

export const useCapacitorBarcodeScanner = () => {
  const [result, setResult] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  // 初期化時にパーミッションをチェック
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkPermission()
    }

    return () => {
      if (Capacitor.isNativePlatform() && isScanning) {
        stopScan()
      }
    }
  }, [])

  const checkPermission = async () => {
    try {
      // カメラのパーミッションをチェック
      const status = await BarcodeScanner.checkPermission({ force: false })

      if (status.granted) {
        setHasPermission(true)
      } else if (status.denied) {
        setError("カメラへのアクセスが拒否されています。設定から許可してください。")
      } else {
        const requestStatus = await BarcodeScanner.checkPermission({ force: true })
        setHasPermission(requestStatus.granted)
      }
    } catch (e) {
      setError("カメラのパーミッション確認中にエラーが発生しました")
      console.error(e)
    }
  }

  const startScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError("このデバイスではバーコードスキャンをサポートしていません")
      return
    }

    if (!hasPermission) {
      await checkPermission()
      if (!hasPermission) return
    }

    try {
      // 背景を非表示にする
      document.body.classList.add("barcode-scanner-active")

      // スキャン開始
      setIsScanning(true)
      setError(null)
      setResult(null)

      // スキャン結果を取得
      const result = await BarcodeScanner.startScan()

      if (result.hasContent) {
        setResult(result.content)
      }
    } catch (e) {
      console.error(e)
      setError("バーコードスキャン中にエラーが発生しました")
    } finally {
      document.body.classList.remove("barcode-scanner-active")
      setIsScanning(false)
    }
  }

  const stopScan = async () => {
    if (Capacitor.isNativePlatform() && isScanning) {
      await BarcodeScanner.stopScan()
      document.body.classList.remove("barcode-scanner-active")
      setIsScanning(false)
    }
  }

  return {
    result,
    isScanning,
    error,
    hasPermission,
    startScan,
    stopScan,
  }
}
