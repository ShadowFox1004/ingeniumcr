import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Calendar, User } from "lucide-react"
import Link from "next/link"
import type { MaintenanceOrder } from "@/lib/types"

interface OrdersListProps {
  orders: MaintenanceOrder[]
}

export function OrdersList({ orders }: OrdersListProps) {
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

  const typeLabels = {
    preventivo: "Preventivo",
    correctivo: "Correctivo",
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-DO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center mt-6">
        <p className="text-muted-foreground">No se encontraron órdenes de mantenimiento</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 mt-6">
      {orders.map((order) => (
        <Card key={order.id} className="p-6 bg-card border-border hover:bg-secondary/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-foreground">{order.title}</h3>
                <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                <Badge className={priorityColors[order.priority]}>{order.priority.toUpperCase()}</Badge>
                <Badge variant="outline">{typeLabels[order.type]}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Maquinaria</p>
                  <p className="text-sm text-foreground font-medium">{order.machinery?.name || "No asignada"}</p>
                  <p className="text-xs text-muted-foreground">{order.machinery?.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Programada</p>
                    <p className="text-sm text-foreground font-medium">{formatDate(order.scheduled_date)}</p>
                  </div>
                </div>
                {order.assigned_to && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Asignado a</p>
                      <p className="text-sm text-foreground font-medium">{order.assigned_to}</p>
                    </div>
                  </div>
                )}
              </div>

              {order.description && <p className="text-sm text-muted-foreground">{order.description}</p>}
            </div>

            <div className="flex gap-2 ml-4">
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/orders/${order.id}/edit`}>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
