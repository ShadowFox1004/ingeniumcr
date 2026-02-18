import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { Suspense } from "react"
import { ConditionalHeader } from "@/components/conditional-header"

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
    <html lang="en" className="h-full">
      <body
        className={`min-h-screen flex flex-col overflow-y-auto font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Suspense fallback={null}>
          <ThemeProvider>
            <ConditionalHeader />
            
            {/* Contenedor real de páginas */}
            <div className="flex-1">
              {children}
            </div>

          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
