"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { themes, type ThemeKey } from "./theme-config"

type ThemeContextType = {
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>("default")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("maintenance-theme") as ThemeKey
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const selectedTheme = themes[theme]

    root.style.setProperty("--primary", selectedTheme.primary)
    root.style.setProperty("--ring", selectedTheme.ring)
    root.style.setProperty("--chart-1", selectedTheme.chart1)
    root.style.setProperty("--chart-2", selectedTheme.chart2)
    root.style.setProperty("--chart-3", selectedTheme.chart3)
    root.style.setProperty("--chart-4", selectedTheme.chart4)
    root.style.setProperty("--chart-5", selectedTheme.chart5)

    localStorage.setItem("maintenance-theme", theme)
  }, [theme, mounted])

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
