import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SensorChartClient } from "./sensor-chart-client"

export async function SensorChart() {
  const supabase = await getSupabaseServerClient()

  // Get recent sensor readings
  const { data: readings } = await supabase
    .from("sensor_readings")
    .select("*, sensor:sensors(name, sensor_type, unit)")
    .order("timestamp", { ascending: false })
    .limit(100)

  // Group by sensor and format for chart
  const chartData =
    readings
      ?.reduce((acc: any[], reading) => {
        const time = new Date(reading.timestamp).toLocaleTimeString("es-DO", {
          hour: "2-digit",
          minute: "2-digit",
        })

        const existingPoint = acc.find((p) => p.time === time)
        if (existingPoint) {
          existingPoint[reading.sensor?.name || "Unknown"] = reading.value
        } else {
          acc.push({
            time,
            [reading.sensor?.name || "Unknown"]: reading.value,
          })
        }
        return acc
      }, [])
      .reverse()
      .slice(-20) || []

  const sensorNames = [...new Set(readings?.map((r) => r.sensor?.name).filter(Boolean))] as string[]

  return <SensorChartClient chartData={chartData} sensorNames={sensorNames} />
}
