// 残り日数を取得する関数
export function getDaysRemaining(item: any): number {
  // 新しいスキーマ（days_remaining）がある場合はそれを使用
  if (item.days_remaining !== undefined) {
    return Math.ceil(item.days_remaining)
  }

  // 古いスキーマ（currentAmount, decrease_rate）から計算
  if (item.currentAmount !== undefined && item.decrease_rate !== undefined && item.decrease_rate > 0) {
    return Math.ceil(item.currentAmount / item.decrease_rate)
  }

  // どちらもない場合はデフォルト値
  return 30
}

// 残り日数が少ないかどうかを判定する関数
export function isLowOnDays(item: any, threshold = 5): boolean {
  const days = getDaysRemaining(item)
  return days <= threshold
}

// 残り日数のパーセンテージを計算する関数（最大120日を100%とする）
export function getDaysPercentage(item: any): number {
  const days = getDaysRemaining(item)
  // 120日を超える場合でも、プログレスバーは100%で表示
  return Math.min(100, (Math.min(days, 120) / 120) * 100)
}
