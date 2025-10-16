import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { MaintenanceOrder } from "@/lib/types"

interface MaintenanceScheduleProps {
  orders: MaintenanceOrder[]
}

export function MaintenanceSchedule({ orders }: MaintenanceScheduleProps) {
  const priorityColors = {
    baja: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
    media: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    alta: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    critica: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  }

  const statusColors = {
    pendiente: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    en_progreso: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    completada: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    cancelada: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
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
    return date.toLocaleDateString("es-DO", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-xl font-bold text-foreground">Programación de Mantenimiento</h3>
          <p className="text-sm text-muted-foreground mt-1">Próximas órdenes de trabajo</p>
        </div>
        <Badge variant="outline" className="font-semibold">
          {orders.length} Órdenes
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.length === 0 ? (
          <div className="col-span-full">
            <p className="text-sm text-muted-foreground text-center py-12">No hay órdenes programadas</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="group p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-foreground text-sm leading-tight flex-1">{order.title}</h4>
                <Badge className={`${priorityColors[order.priority]} font-medium text-xs shrink-0`}>
                  {order.priority.toUpperCase()}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground font-medium">{order.machinery?.name}</p>

              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-medium">{formatDate(order.scheduled_date)}</span>
                </div>
                <Badge className={`${statusColors[order.status]} text-xs font-medium`}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
