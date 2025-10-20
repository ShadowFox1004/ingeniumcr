import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { Suspense } from "react"
import { AppHeader } from "@/components/app-header"

export const metadata: Metadata = {
  title: "IngeniumCR - Sistema de Mantenimiento",
  description: "Sistema de Mantenimiento Industrial - Ingenio Central Romana Corporation",
  generator: ".com",
  icons: {
    icon: "/images/cr-logo.jpg",
    apple: "/images/cr-logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider>
            <AppHeader />
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
