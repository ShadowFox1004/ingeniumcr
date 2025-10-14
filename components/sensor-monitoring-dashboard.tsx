import { createClient } from "@/lib/supabase/server"
import { SensorMonitoringClient } from "./sensor-monitoring-client"

export async function SensorMonitoringDashboard() {
  const supabase = await createClient()

  // Fetch sensor data
  const { data: sensors } = await supabase
    .from("sensors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  // Get latest readings for each sensor type
  const latestReadings = sensors?.slice(0, 6) || []

  // Prepare chart data for historical view
  const chartData =
    sensors
      ?.slice(0, 20)
      .reverse()
      .map((sensor, index) => ({
        time: new Date(sensor.created_at).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: sensor.value,
        sensorName: sensor.name,
      })) || []

  return <SensorMonitoringClient latestReadings={latestReadings} chartData={chartData} />
}
