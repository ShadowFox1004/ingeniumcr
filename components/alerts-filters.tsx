"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function AlertsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSeverityChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("severity")
    } else {
      params.set("severity", value)
    }
    router.push(`/alerts?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`/alerts?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/alerts")
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Select defaultValue={searchParams.get("severity") || "all"} onValueChange={handleSeverityChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Severidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las severidades</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="warning">Advertencia</SelectItem>
          <SelectItem value="critical">Crítico</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get("status") || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activa</SelectItem>
          <SelectItem value="acknowledged">Reconocida</SelectItem>
          <SelectItem value="resolved">Resuelta</SelectItem>
        </SelectContent>
      </Select>

      {(searchParams.get("severity") || searchParams.get("status")) && (
        <Button variant="outline" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
