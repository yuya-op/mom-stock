export interface Item {
  id: number
  name: string
  category: string
  // Legacy fields (kept for backward compatibility)
  currentAmount?: number // Legacy field
  totalAmount?: number // Legacy field
  decrease_rate?: number // Legacy field
  // New fields
  days_remaining: number
  last_updated: string
  consumption_days?: number // 1個あたりの消費日数
  stock_count?: number // 在庫数
  imageUrl: string | null
  purchaseUrl: string
  user_id?: string
}
