import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Activity } from "lucide-react"
import Link from "next/link"
import type { Sensor } from "@/lib/types"
import { getSupabaseServerClient } from "@/lib/supabase/server"

interface SensorsListProps {
  sensors: Sensor[]
}

async function getLatestReading(sensorId: string) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from("sensor_readings")
    .select("value, status, timestamp")
    .eq("sensor_id", sensorId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function SensorsList({ sensors }: SensorsListProps) {
  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  }

  const readingStatusColors = {
    normal: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  if (sensors.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center mt-6">
        <p className="text-muted-foreground">No se encontraron sensores</p>
      </Card>
    )
  }

  const sensorsWithReadings = await Promise.all(
    sensors.map(async (sensor) => ({
      ...sensor,
      latestReading: await getLatestReading(sensor.id),
    })),
  )

  return (
    <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
      {sensorsWithReadings.map((sensor) => (
        <Card key={sensor.id} className="p-6 bg-card border-border hover:bg-secondary/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">{sensor.name}</h3>
              <p className="text-sm text-muted-foreground">{sensor.machinery?.name}</p>
            </div>
            <Badge className={statusColors[sensor.status as keyof typeof statusColors] || statusColors.active}>
              {sensor.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium text-foreground capitalize">{sensor.sensor_type}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Unidad</p>
                <p className="text-sm font-medium text-foreground">{sensor.unit}</p>
              </div>
            </div>

            {sensor.latestReading && (
              <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Última Lectura</p>
                  </div>
                  <Badge
                    className={
                      readingStatusColors[sensor.latestReading.status as keyof typeof readingStatusColors] ||
                      readingStatusColors.normal
                    }
                  >
                    {sensor.latestReading.status}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {sensor.latestReading.value} {sensor.unit}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(sensor.latestReading.timestamp).toLocaleString("es-DO")}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Min: {sensor.threshold_min} {sensor.unit}
              </span>
              <span>
                Max: {sensor.threshold_max} {sensor.unit}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Link href={`/sensors/${sensor.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            </Link>
            <Link href={`/sensors/${sensor.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}
