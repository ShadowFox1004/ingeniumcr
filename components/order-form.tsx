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
import type { MaintenanceOrder, Machinery } from "@/lib/types"

interface OrderFormProps {
  order?: MaintenanceOrder
  machinery: Machinery[]
}

export function OrderForm({ order, machinery }: OrderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    machinery_id: order?.machinery_id || "",
    title: order?.title || "",
    type: order?.type || "preventivo",
    priority: order?.priority || "media",
    status: order?.status || "pendiente",
    description: order?.description || "",
    assigned_to: order?.assigned_to || "",
    scheduled_date: order?.scheduled_date ? new Date(order.scheduled_date).toISOString().slice(0, 16) : "",
    cost: order?.cost?.toString() || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    try {
      const dataToSubmit = {
        ...formData,
        cost: formData.cost ? Number.parseFloat(formData.cost) : null,
        scheduled_date: formData.scheduled_date || null,
      }

      if (order) {
        const { error } = await supabase.from("maintenance_orders").update(dataToSubmit).eq("id", order.id)

        if (error) throw error

        toast({
          title: "Orden actualizada",
          description: "Los cambios se han guardado correctamente",
        })
      } else {
        const { error } = await supabase.from("maintenance_orders").insert([dataToSubmit])

        if (error) throw error

        toast({
          title: "Orden creada",
          description: "La orden de mantenimiento se ha creado correctamente",
        })
      }

      router.push("/orders")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la orden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="machinery_id">Maquinaria *</Label>
          <Select
            value={formData.machinery_id}
            onValueChange={(value) => setFormData({ ...formData, machinery_id: value })}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Seleccionar maquinaria" />
            </SelectTrigger>
            <SelectContent>
              {machinery.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {machine.name} - {machine.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad *</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Fecha Programada</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Asignado a</Label>
            <Input
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Costo Estimado (USD)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
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
            {loading ? "Guardando..." : order ? "Actualizar Orden" : "Crear Orden"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
