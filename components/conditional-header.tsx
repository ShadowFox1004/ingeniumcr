"use client"

import { usePathname } from "next/navigation"
import { AppHeader } from "./app-header"

export function ConditionalHeader() {
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/login"

  if (isAuthPage) {
    return null
  }

  return <AppHeader />
}
