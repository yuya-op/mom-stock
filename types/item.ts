export interface Item {
  id: number
  name: string
  category: string
  // Legacy fields (kept for backward compatibility)
  currentAmount?: number
  totalAmount?: number
  decrease_rate?: number
  // New fields
  days_remaining: number
  last_updated: string
  consumption_days: number // 1個あたりの消費日数
  stock_count: number // 在庫数
  imageUrl: string | null
  purchaseUrl: string
  user_id?: string
  barcode?: string
}

export interface ShoppingListItem {
  id: string
  item_id: number
  name: string
  category: string
  currentAmount?: number
  totalAmount?: number
  decrease_rate?: number
  days_remaining?: number
  consumption_days?: number
  stock_count?: number
  imageUrl: string | null
  purchaseUrl: string
}

export interface BarcodeProduct {
  id?: number
  name: string
  category: string
  imageUrl: string | null
  consumption_days: number
  barcode: string
}

export interface BarcodeResponse {
  source: "database" | "external"
  product: BarcodeProduct
  error?: string
}
