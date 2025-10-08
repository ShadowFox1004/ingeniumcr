import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Machinery } from "@/lib/types"

interface MachineryStatusProps {
  machinery: Machinery[]
}

export function MachineryStatus({ machinery }: MachineryStatusProps) {
  const statusColors = {
    operational: "bg-green-500/10 text-green-500 border-green-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    offline: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusLabels = {
    operational: "Operacional",
    maintenance: "Mantenimiento",
    warning: "Advertencia",
    offline: "Fuera de Línea",
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Estado de Maquinarias</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {machinery.map((machine) => (
          <div
            key={machine.id}
            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{machine.name}</p>
              <p className="text-xs text-muted-foreground">{machine.location}</p>
            </div>
            <Badge className={statusColors[machine.status]}>{statusLabels[machine.status]}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
