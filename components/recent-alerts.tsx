import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, XCircle } from "lucide-react"
import type { Alert } from "@/lib/types"

interface RecentAlertsProps {
  alerts: Alert[]
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const severityConfig = {
    info: {
      icon: <Info className="h-4 w-4" />,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    critical: {
      icon: <XCircle className="h-4 w-4" />,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  }

  const severityLabels = {
    info: "Info",
    warning: "Advertencia",
    critical: "Crítico",
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Alertas Recientes</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay alertas activas</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${severityConfig[alert.severity].className}`}>
                  {severityConfig[alert.severity].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm">{alert.alert_type}</p>
                    <Badge className={severityConfig[alert.severity].className}>{severityLabels[alert.severity]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.machinery?.name || "Maquinaria desconocida"}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
