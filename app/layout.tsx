import type React from "react"
import type { Metadata } from "next"
import { Inter, M_PLUS_Rounded_1c } from "next/font/google"
import "./globals.css"
import { PushNotificationSetup } from "@/components/push-notification-setup"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const mplus = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mplus",
})

export const metadata: Metadata = {
  title: "mom-stock - 育児ママの味方",
  description: "おむつや綿棒、ローションなどの在庫管理をスマートに。",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${mplus.variable} font-mplus`}>
        <PushNotificationSetup />
        {children}
      </body>
    </html>
  )
}
