import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Machinery } from "@/lib/types"
import { MapPin } from "lucide-react"

interface MachineryStatusProps {
  machinery: Machinery[]
}

export function MachineryStatus({ machinery }: MachineryStatusProps) {
  const statusColors = {
    operational: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 shadow-green-500/10",
    maintenance: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 shadow-yellow-500/10",
    warning: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 shadow-orange-500/10",
    offline: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 shadow-red-500/10",
  }

  const statusLabels = {
    operational: "Operacional",
    maintenance: "Mantenimiento",
    warning: "Advertencia",
    offline: "Fuera de Línea",
  }

  return (
    <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full max-h-[925px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground truncate">Estado de Maquinarias</h3>
          <p className="text-sm text-muted-foreground mt-1">Monitoreo en tiempo real</p>
        </div>
        <Badge variant="outline" className="font-semibold flex-shrink-0 ml-4">
          {machinery.length} Total
        </Badge>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {machinery.map((machine) => (
          <div
            key={machine.id}
            className="group flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="font-semibold text-foreground truncate text-sm">{machine.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{machine.location}</span>
              </div>
            </div>
            <Badge
              className={`${statusColors[machine.status]} font-medium shadow-sm flex-shrink-0 whitespace-nowrap text-xs px-2 py-1`}
            >
              {statusLabels[machine.status]}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
