import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { MachineryStatus } from "@/components/machinery-status"
import { MaintenanceSchedule } from "@/components/maintenance-schedule"
import { AlertTriangle, Wrench, Gauge, TrendingUp } from "lucide-react"
import { SensorMonitoringDashboard } from "@/components/sensor-monitoring-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch dashboard data
  const [{ data: machinery }, { data: alerts }, { data: orders }, { data: sensors }] = await Promise.all([
    supabase.from("machinery").select("*"),
    supabase
      .from("alerts")
      .select("*, machinery(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("maintenance_orders")
      .select("*, machinery(name)")
      .order("scheduled_date", { ascending: true })
      .limit(5),
    supabase.from("sensors").select("*").limit(10),
  ])

  // Calculate stats
  const totalMachinery = machinery?.length || 0
  const operationalCount = machinery?.filter((m) => m.status === "operational").length || 0
  const maintenanceCount = machinery?.filter((m) => m.status === "maintenance").length || 0
  const warningCount = machinery?.filter((m) => m.status === "warning").length || 0
  const activeAlerts = alerts?.length || 0
  const pendingOrders = orders?.filter((o) => o.status === "pendiente").length || 0

  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/dashboard-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStats
              title="Total Maquinarias"
              value={totalMachinery}
              icon={<Gauge className="h-5 w-5" />}
              description={`${operationalCount} operacionales`}
              trend="neutral"
              color="blue"
            />
            <DashboardStats
              title="Alertas Activas"
              value={activeAlerts}
              icon={<AlertTriangle className="h-5 w-5" />}
              description={`${warningCount} en advertencia`}
              trend={activeAlerts > 0 ? "down" : "neutral"}
              color="red"
            />
            <DashboardStats
              title="Órdenes Pendientes"
              value={pendingOrders}
              icon={<Wrench className="h-5 w-5" />}
              description={`${maintenanceCount} en mantenimiento`}
              trend="neutral"
              color="orange"
            />
            <DashboardStats
              title="Eficiencia"
              value={`${Math.round((operationalCount / totalMachinery) * 100)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Disponibilidad operativa"
              trend={operationalCount / totalMachinery > 0.8 ? "up" : "down"}
              color="green"
            />
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Suspense
              fallback={
                <div className="h-[400px] sm:h-[600px] bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 animate-pulse" />
              }
            >
              <SensorMonitoringDashboard />
            </Suspense>
            <MachineryStatus machinery={machinery || []} />
          </div>

          <MaintenanceSchedule orders={orders || []} />
        </main>
      </div>
    </div>
  )
}
