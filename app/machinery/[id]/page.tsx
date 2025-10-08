import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function MachineryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: machinery } = await supabase.from("machinery").select("*").eq("id", params.id).single()

  if (!machinery) {
    notFound()
  }

  const { data: sensors } = await supabase.from("sensors").select("*").eq("machinery_id", params.id)

  const { data: orders } = await supabase
    .from("maintenance_orders")
    .select("*")
    .eq("machinery_id", params.id)
    .order("created_at", { ascending: false })

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
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/machinery">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{machinery.name}</h1>
                <p className="text-sm text-muted-foreground">{machinery.type}</p>
              </div>
            </div>
            <Link href={`/machinery/${params.id}/edit`}>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Información General</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge className={`${statusColors[machinery.status]} mt-1`}>{statusLabels[machinery.status]}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="text-foreground font-medium mt-1">{machinery.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Instalación</p>
                  <p className="text-foreground font-medium mt-1">
                    {new Date(machinery.installation_date).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último Mantenimiento</p>
                  <p className="text-foreground font-medium mt-1">
                    {machinery.last_maintenance
                      ? new Date(machinery.last_maintenance).toLocaleDateString("es-DO")
                      : "N/A"}
                  </p>
                </div>
              </div>
              {machinery.description && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-foreground mt-1">{machinery.description}</p>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Historial de Mantenimiento ({orders?.length || 0})
              </h2>
              <div className="space-y-3">
                {orders?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay órdenes de mantenimiento registradas
                  </p>
                ) : (
                  orders?.map((order) => (
                    <div key={order.id} className="p-4 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{order.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{order.type}</p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Sensores ({sensors?.length || 0})</h2>
              <div className="space-y-3">
                {sensors?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay sensores configurados</p>
                ) : (
                  sensors?.map((sensor) => (
                    <div key={sensor.id} className="p-3 bg-secondary/50 rounded-lg border border-border">
                      <p className="font-medium text-foreground text-sm">{sensor.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sensor.sensor_type} ({sensor.unit})
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
