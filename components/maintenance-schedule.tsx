import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { MaintenanceOrder } from "@/lib/types"

interface MaintenanceScheduleProps {
  orders: MaintenanceOrder[]
}

export function MaintenanceSchedule({ orders }: MaintenanceScheduleProps) {
  const priorityColors = {
    baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critica: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusColors = {
    pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    en_progreso: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completada: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelada: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }

  const statusLabels = {
    pendiente: "Pendiente",
    en_progreso: "En Progreso",
    completada: "Completada",
    cancelada: "Cancelada",
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-DO", { month: "short", day: "numeric" })
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Programación de Mantenimiento</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay órdenes programadas</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm mb-1">{order.title}</p>
                  <p className="text-xs text-muted-foreground">{order.machinery?.name}</p>
                </div>
                <Badge className={priorityColors[order.priority]}>{order.priority.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(order.scheduled_date)}</span>
                </div>
                <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
