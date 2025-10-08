"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackToDashboardButton() {
  const router = useRouter()

  return (
    <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
      <ArrowLeft className="h-4 w-4" />
      Volver al Dashboard
    </Button>
  )
}
