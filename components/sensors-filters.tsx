"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Machinery } from "@/lib/types"

interface SensorsFiltersProps {
  machinery: Pick<Machinery, "id" | "name">[]
}

export function SensorsFilters({ machinery }: SensorsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.push(`/sensors?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`/sensors?${params.toString()}`)
  }

  const handleMachineryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("machinery")
    } else {
      params.set("machinery", value)
    }
    router.push(`/sensors?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/sensors")
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Select defaultValue={searchParams.get("type") || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Tipo de Sensor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="temperatura">Temperatura</SelectItem>
          <SelectItem value="vibracion">Vibración</SelectItem>
          <SelectItem value="presion">Presión</SelectItem>
          <SelectItem value="velocidad">Velocidad</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get("status") || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
          <SelectItem value="maintenance">Mantenimiento</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get("machinery") || "all"} onValueChange={handleMachineryChange}>
        <SelectTrigger className="w-full md:w-64 bg-card border-border">
          <SelectValue placeholder="Maquinaria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las maquinarias</SelectItem>
          {machinery.map((machine) => (
            <SelectItem key={machine.id} value={machine.id}>
              {machine.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(searchParams.get("type") || searchParams.get("status") || searchParams.get("machinery")) && (
        <Button variant="outline" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
