"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function MachineryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`/machinery?${params.toString()}`)
  }

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.push(`/machinery?${params.toString()}`)
  }

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    router.push(`/machinery?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    router.push("/machinery")
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Buscar maquinaria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-card border-border"
        />
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <Select defaultValue={searchParams.get("status") || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="operational">Operacional</SelectItem>
          <SelectItem value="maintenance">Mantenimiento</SelectItem>
          <SelectItem value="warning">Advertencia</SelectItem>
          <SelectItem value="offline">Fuera de Línea</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("type") || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full md:w-48 bg-card border-border">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="Molino">Molino</SelectItem>
          <SelectItem value="Caldera">Caldera</SelectItem>
          <SelectItem value="Generador">Generador</SelectItem>
          <SelectItem value="Bomba">Bomba</SelectItem>
          <SelectItem value="Compresor">Compresor</SelectItem>
          <SelectItem value="Evaporador">Evaporador</SelectItem>
          <SelectItem value="Centrífuga">Centrífuga</SelectItem>
        </SelectContent>
      </Select>
      {(searchParams.get("status") || searchParams.get("type") || searchParams.get("search")) && (
        <Button variant="outline" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
