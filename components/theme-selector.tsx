"use client"

import { useTheme } from "@/lib/theme-provider"
import { themes, type ThemeKey } from "@/lib/theme-config"
import { Check } from "lucide-react"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecciona un tema de color para personalizar la interfaz del sistema
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(themes) as ThemeKey[]).map((themeKey) => {
          const themeConfig = themes[themeKey]
          const isSelected = theme === themeKey

          return (
            <button
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                isSelected ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{themeConfig.name}</span>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex gap-1">
                <div
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: themeConfig.primary }}
                />
                <div
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: themeConfig.chart2 }}
                />
                <div
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: themeConfig.chart3 }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
