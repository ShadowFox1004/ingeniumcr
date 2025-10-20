"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, Settings } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { MobileNav } from "@/components/mobile-nav"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const pathname = usePathname()

  // Don't show header on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <header className="border-b border-border/40 bg-card/80 backdrop-blur-xl shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 flex-shrink-0">
              <Image src="/images/cr-logo.jpg" alt="CR Logo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                IngeniumCR
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden sm:block">
                Sistema de Mantenimiento Industrial
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link href="/machinery">
              <Button
                variant={pathname === "/machinery" ? "default" : "ghost"}
                size="sm"
                className="font-medium hover:bg-primary/10"
              >
                Maquinarias
              </Button>
            </Link>
            <Link href="/orders">
              <Button
                variant={pathname === "/orders" ? "default" : "ghost"}
                size="sm"
                className="font-medium hover:bg-primary/10"
              >
                Órdenes
              </Button>
            </Link>
            <Link href="/sensors">
              <Button
                variant={pathname === "/sensors" ? "default" : "ghost"}
                size="sm"
                className="font-medium hover:bg-primary/10"
              >
                Sensores
              </Button>
            </Link>
            <Link href="/alerts">
              <Button
                variant={pathname === "/alerts" ? "default" : "ghost"}
                size="sm"
                className="font-medium hover:bg-primary/10"
              >
                Alertas
              </Button>
            </Link>
            <div className="h-6 w-px bg-border/50 mx-2" />
            <Link href="/ai-assistant">
              <Button
                size="sm"
                className="font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                <Bot className="h-4 w-4 mr-2" />
                Asistente IA
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="font-medium">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <LogoutButton />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Sistema Activo</span>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
