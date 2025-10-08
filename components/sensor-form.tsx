"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Sensor, Machinery } from "@/lib/types"

interface SensorFormProps {
  sensor?: Sensor
  machinery: Machinery[]
}

export function SensorForm({ sensor, machinery }: SensorFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    machinery_id: sensor?.machinery_id || "",
    name: sensor?.name || "",
    sensor_type: sensor?.sensor_type || "",
    unit: sensor?.unit || "",
    threshold_min: sensor?.threshold_min?.toString() || "",
    threshold_max: sensor?.threshold_max?.toString() || "",
    status: sensor?.status || "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    try {
      const dataToSubmit = {
        ...formData,
        threshold_min: formData.threshold_min ? Number.parseFloat(formData.threshold_min) : null,
        threshold_max: formData.threshold_max ? Number.parseFloat(formData.threshold_max) : null,
      }

      if (sensor) {
        const { error } = await supabase.from("sensors").update(dataToSubmit).eq("id", sensor.id)

        if (error) throw error

        toast({
          title: "Sensor actualizado",
          description: "Los cambios se han guardado correctamente",
        })
      } else {
        const { error } = await supabase.from("sensors").insert([dataToSubmit])

        if (error) throw error

        toast({
          title: "Sensor creado",
          description: "El sensor se ha registrado correctamente",
        })
      }

      router.push("/sensors")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el sensor",
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
          <Label htmlFor="name">Nombre del Sensor *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sensor_type">Tipo de Sensor *</Label>
            <Select
              value={formData.sensor_type}
              onValueChange={(value) => setFormData({ ...formData, sensor_type: value })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperatura">Temperatura</SelectItem>
                <SelectItem value="vibracion">Vibración</SelectItem>
                <SelectItem value="presion">Presión</SelectItem>
                <SelectItem value="velocidad">Velocidad</SelectItem>
                <SelectItem value="humedad">Humedad</SelectItem>
                <SelectItem value="corriente">Corriente</SelectItem>
                <SelectItem value="voltaje">Voltaje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidad de Medida *</Label>
            <Input
              id="unit"
              required
              placeholder="ej: °C, Hz, PSI, RPM"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold_min">Umbral Mínimo</Label>
            <Input
              id="threshold_min"
              type="number"
              step="0.01"
              value={formData.threshold_min}
              onChange={(e) => setFormData({ ...formData, threshold_min: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold_max">Umbral Máximo</Label>
            <Input
              id="threshold_max"
              type="number"
              step="0.01"
              value={formData.threshold_max}
              onChange={(e) => setFormData({ ...formData, threshold_max: e.target.value })}
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
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : sensor ? "Actualizar Sensor" : "Crear Sensor"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
