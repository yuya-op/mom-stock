"use client"

import { useState, useEffect, useRef } from "react"
import { BrowserMultiFormatReader, type Result, BarcodeFormat } from "@zxing/library"

export const useBarcodeScanner = () => {
  const [result, setResult] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    // BrowserMultiFormatReaderをインスタンス化
    const hints = new Map()
    const formats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_39, BarcodeFormat.CODE_128]
    hints.set(2, formats)

    readerRef.current = new BrowserMultiFormatReader(hints)

    // コンポーネントのアンマウント時にリソースを解放
    return () => {
      if (readerRef.current) {
        readerRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) {
      setError("スキャナーの初期化に失敗しました")
      return
    }

    try {
      setIsScanning(true)
      setError(null)
      setResult(null)

      // カメラを選択するための制約
      const constraints = {
        video: {
          facingMode: "environment", // 背面カメラを優先
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      // カメラへのアクセスを開始し、ビデオストリームを取得
      await readerRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result: Result | null, error: any) => {
          if (result) {
            // バーコードを検出したら結果を設定して停止
            setResult(result.getText())
            stopScanning()
          }
          if (error && !(error instanceof TypeError)) {
            // スキャン中にエラーが発生した場合（TypeErrorは無視）
            console.error("Scanning error:", error)
          }
        },
      )
    } catch (err) {
      console.error("Failed to start scanning:", err)
      setError("カメラにアクセスできませんでした。カメラへのアクセスを許可してください。")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
      setIsScanning(false)
    }
  }

  return {
    videoRef,
    result,
    isScanning,
    error,
    startScanning,
    stopScanning,
  }
}
