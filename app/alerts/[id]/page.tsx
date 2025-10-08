import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Info, XCircle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertActions } from "@/components/alert-actions"

export default async function AlertDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: alert } = await supabase
    .from("alerts")
    .select("*, machinery(*), sensor:sensors(*)")
    .eq("id", params.id)
    .single()

  if (!alert) {
    notFound()
  }

  const severityConfig = {
    info: {
      icon: <Info className="h-6 w-6" />,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      label: "Información",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6" />,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      label: "Advertencia",
    },
    critical: {
      icon: <XCircle className="h-6 w-6" />,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      label: "Crítico",
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

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/alerts">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{alert.alert_type}</h1>
                <p className="text-sm text-muted-foreground">{severityConfig[alert.severity].label}</p>
              </div>
            </div>
            <AlertActions alert={alert} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-lg ${severityConfig[alert.severity].className}`}>
                {severityConfig[alert.severity].icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={severityConfig[alert.severity].className}>
                    {severityConfig[alert.severity].label}
                  </Badge>
                  <Badge className={statusColors[alert.status]}>{statusLabels[alert.status]}</Badge>
                </div>
                <p className="text-lg text-foreground">{alert.message}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Maquinaria Afectada</h3>
                <Link href={`/machinery/${alert.machinery?.id}`}>
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors">
                    <p className="font-semibold text-foreground">{alert.machinery?.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.machinery?.type}</p>
                    <p className="text-sm text-muted-foreground">{alert.machinery?.location}</p>
                  </div>
                </Link>
              </div>

              {alert.sensor && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Sensor Relacionado</h3>
                  <Link href={`/sensors/${alert.sensor.id}`}>
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors">
                      <p className="font-semibold text-foreground">{alert.sensor.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">{alert.sensor.sensor_type}</p>
                      <p className="text-sm text-muted-foreground">Unidad: {alert.sensor.unit}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Temporal</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                <p className="text-foreground font-medium mt-1">
                  {new Date(alert.created_at).toLocaleString("es-DO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {alert.resolved_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Resolución</p>
                  <p className="text-foreground font-medium mt-1">
                    {new Date(alert.resolved_at).toLocaleString("es-DO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {alert.status !== "resolved" && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Recomendadas</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Verificar el estado de la maquinaria afectada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Revisar las lecturas del sensor relacionado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Crear una orden de mantenimiento si es necesario</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Documentar las acciones tomadas</span>
                </li>
              </ul>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
