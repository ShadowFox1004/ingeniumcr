"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Machinery } from "@/lib/types"

interface MachineryFormProps {
  machinery?: Machinery
}

export function MachineryForm({ machinery }: MachineryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: machinery?.name || "",
    type: machinery?.type || "",
    location: machinery?.location || "",
    status: machinery?.status || "operational",
    installation_date: machinery?.installation_date || "",
    description: machinery?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    try {
      if (machinery) {
        const { error } = await supabase.from("machinery").update(formData).eq("id", machinery.id)

        if (error) throw error

        toast({
          title: "Maquinaria actualizada",
          description: "Los cambios se han guardado correctamente",
        })
      } else {
        const { error } = await supabase.from("machinery").insert([formData])

        if (error) throw error

        toast({
          title: "Maquinaria creada",
          description: "La maquinaria se ha registrado correctamente",
        })
      }

      router.push("/machinery")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la maquinaria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Molino">Molino</SelectItem>
                <SelectItem value="Caldera">Caldera</SelectItem>
                <SelectItem value="Generador">Generador</SelectItem>
                <SelectItem value="Bomba">Bomba</SelectItem>
                <SelectItem value="Compresor">Compresor</SelectItem>
                <SelectItem value="Evaporador">Evaporador</SelectItem>
                <SelectItem value="Centrífuga">Centrífuga</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="warning">Advertencia</SelectItem>
                <SelectItem value="offline">Fuera de Línea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installation_date">Fecha de Instalación *</Label>
            <Input
              id="installation_date"
              type="date"
              required
              value={formData.installation_date}
              onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : machinery ? "Actualizar" : "Crear Maquinaria"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
