"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, XCircle, Check, Eye } from "lucide-react"
import Link from "next/link"
import type { Alert } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter()
  const { toast } = useToast()

  const severityConfig = {
    info: {
      icon: <Info className="h-5 w-5" />,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    critical: {
      icon: <XCircle className="h-5 w-5" />,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  }

  const statusColors = {
    active: "bg-red-500/10 text-red-500 border-red-500/20",
    acknowledged: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  const statusLabels = {
    active: "Activa",
    acknowledged: "Reconocida",
    resolved: "Resuelta",
  }

  const handleAcknowledge = async (alertId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("alerts").update({ status: "acknowledged" }).eq("id", alertId)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo reconocer la alerta",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Alerta reconocida",
        description: "La alerta ha sido marcada como reconocida",
      })
      router.refresh()
    }
  }

  const handleResolve = async (alertId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from("alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", alertId)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta",
      })
      router.refresh()
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center mt-6">
        <p className="text-muted-foreground">No se encontraron alertas</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 mt-6">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-4 sm:p-6 bg-card border-border hover:bg-secondary/50 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={`p-3 rounded-lg ${severityConfig[alert.severity].className} self-start`}>
              {severityConfig[alert.severity].icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{alert.alert_type}</h3>
                <Badge className={severityConfig[alert.severity].className}>{alert.severity.toUpperCase()}</Badge>
                <Badge className={statusColors[alert.status]}>{statusLabels[alert.status]}</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Maquinaria</p>
                  <p className="text-foreground font-medium">{alert.machinery?.name || "No especificada"}</p>
                </div>
                {alert.sensor && (
                  <div>
                    <p className="text-muted-foreground">Sensor</p>
                    <p className="text-foreground font-medium">{alert.sensor.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="text-foreground font-medium">{new Date(alert.created_at).toLocaleString("es-DO")}</p>
                </div>
              </div>

              {alert.resolved_at && (
                <div className="mt-3 text-sm">
                  <p className="text-muted-foreground">
                    Resuelta el {new Date(alert.resolved_at).toLocaleString("es-DO")}
                  </p>
                </div>
              )}
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <Link href={`/alerts/${alert.id}`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full">
                  <Eye className="h-4 w-4" />
                  <span className="sm:inline">Ver</span>
                </Button>
              </Link>
              {alert.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAcknowledge(alert.id)}
                  className="gap-2 flex-1 sm:flex-none w-full"
                >
                  <Check className="h-4 w-4" />
                  <span className="sm:inline">Reconocer</span>
                </Button>
              )}
              {alert.status !== "resolved" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolve(alert.id)}
                  className="gap-2 flex-1 sm:flex-none w-full"
                >
                  <Check className="h-4 w-4" />
                  <span className="sm:inline">Resolver</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
