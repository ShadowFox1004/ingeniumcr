"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bot, Settings, AlertTriangle, Wrench, Gauge, Activity, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>
          <Image src="/images/cr-logo.jpg" alt="CR Logo" width={80} height={80} />
          <div className="flex flex-col gap-4 mt-6">

            <Link href="/" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <LayoutDashboard className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
            </Link>

            <Link href="/machinery" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <Gauge className="h-4 w-4 mr-3" />
                Maquinarias
              </Button>
            </Link>

            <Link href="/orders" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <Wrench className="h-4 w-4 mr-3" />
                Órdenes
              </Button>
            </Link>
            <Link href="/sensors" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <Activity className="h-4 w-4 mr-3" />
                Sensores
              </Button>
            </Link>
            <Link href="/alerts" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <AlertTriangle className="h-4 w-4 mr-3" />
                Alertas
              </Button>
            </Link>

            <div className="h-px bg-border my-2" />

            <Link href="/ai-assistant" onClick={() => setOpen(false)}>
              <Button className="w-full justify-start font-medium bg-gradient-to-r from-primary to-primary/80">
                <Bot className="h-4 w-4 mr-3" />
                Asistente IA
              </Button>
            </Link>

            <Link href="/settings" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <Settings className="h-4 w-4 mr-3" />
                Configuración
              </Button>
            </Link>

            <div className="h-px bg-border my-2" />

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Sistema Activo</span>
            </div>

            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
