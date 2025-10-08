import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SensorReadingsChart } from "@/components/sensor-readings-chart"

export default async function SensorDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: sensor } = await supabase.from("sensors").select("*, machinery(*)").eq("id", params.id).single()

  if (!sensor) {
    notFound()
  }

  const { data: readings } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("sensor_id", params.id)
    .order("timestamp", { ascending: false })
    .limit(100)

  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  }

  const latestReading = readings?.[0]

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sensors">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{sensor.name}</h1>
                <p className="text-sm text-muted-foreground capitalize">{sensor.sensor_type}</p>
              </div>
            </div>
            <Link href={`/sensors/${params.id}/edit`}>
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
              <h2 className="text-lg font-semibold text-foreground mb-4">Lecturas en Tiempo Real</h2>
              <SensorReadingsChart readings={readings || []} unit={sensor.unit} />
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Historial de Lecturas</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {readings?.slice(0, 20).map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {reading.value} {sensor.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reading.timestamp).toLocaleString("es-DO")}
                      </p>
                    </div>
                    <Badge
                      className={
                        reading.status === "normal"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : reading.status === "warning"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {reading.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Información del Sensor</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    className={`${statusColors[sensor.status as keyof typeof statusColors] || statusColors.active} mt-1`}
                  >
                    {sensor.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="text-foreground font-medium mt-1 capitalize">{sensor.sensor_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unidad de Medida</p>
                  <p className="text-foreground font-medium mt-1">{sensor.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Umbral Mínimo</p>
                  <p className="text-foreground font-medium mt-1">
                    {sensor.threshold_min} {sensor.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Umbral Máximo</p>
                  <p className="text-foreground font-medium mt-1">
                    {sensor.threshold_max} {sensor.unit}
                  </p>
                </div>
              </div>
            </Card>

            {latestReading && (
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Última Lectura</h2>
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground mb-2">
                    {latestReading.value} {sensor.unit}
                  </p>
                  <Badge
                    className={
                      latestReading.status === "normal"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : latestReading.status === "warning"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                    }
                  >
                    {latestReading.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-3">
                    {new Date(latestReading.timestamp).toLocaleString("es-DO")}
                  </p>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Maquinaria</h2>
              <Link href={`/machinery/${sensor.machinery?.id}`}>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <p className="font-semibold text-foreground">{sensor.machinery?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{sensor.machinery?.type}</p>
                  <p className="text-sm text-muted-foreground">{sensor.machinery?.location}</p>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
