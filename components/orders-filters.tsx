"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function OrdersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`/orders?${params.toString()}`)
  }

  const handlePriorityChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("priority")
    } else {
      params.set("priority", value)
    }
    router.push(`/orders?${params.toString()}`)
  }

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.push(`/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/orders")
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Select defaultValue={searchParams.get("status") || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="en_progreso">En Progreso</SelectItem>
          <SelectItem value="completada">Completada</SelectItem>
          <SelectItem value="cancelada">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get("priority") || "all"} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las prioridades</SelectItem>
          <SelectItem value="baja">Baja</SelectItem>
          <SelectItem value="media">Media</SelectItem>
          <SelectItem value="alta">Alta</SelectItem>
          <SelectItem value="critica">Crítica</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get("type") || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="preventivo">Preventivo</SelectItem>
          <SelectItem value="correctivo">Correctivo</SelectItem>
        </SelectContent>
      </Select>

      {(searchParams.get("status") || searchParams.get("priority") || searchParams.get("type")) && (
        <Button variant="outline" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
