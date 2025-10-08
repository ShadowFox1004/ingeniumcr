"use client"

import { useTheme } from "@/lib/theme-provider"
import { Moon, Sun } from "lucide-react"

export function DarkModeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Modo de Visualización</p>
          <p className="text-sm text-muted-foreground">Cambia entre modo claro y oscuro</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("light")}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
            mode === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
        >
          <Sun className="h-6 w-6" />
          <span className="text-sm font-medium">Claro</span>
        </button>

        <button
          onClick={() => setMode("dark")}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
            mode === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
        >
          <Moon className="h-6 w-6" />
          <span className="text-sm font-medium">Oscuro</span>
        </button>
      </div>
    </div>
  )
}
