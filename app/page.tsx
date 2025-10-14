import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { MachineryStatus } from "@/components/machinery-status"
import { MaintenanceSchedule } from "@/components/maintenance-schedule"
import { LogoutButton } from "@/components/logout-button"
import { Activity, AlertTriangle, Wrench, Gauge, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: "url('/images/dashboard-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Mantenimiento</h1>
                <p className="text-sm text-muted-foreground">Ingenio Central Romana</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/machinery">
                  <Button variant="outline">Maquinarias</Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline">Órdenes</Button>
                </Link>
                <Link href="/sensors">
                  <Button variant="outline">Sensores</Button>
                </Link>
                <Link href="/alerts">
                  <Button variant="outline">Alertas</Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    Ajustes
                  </Button>
                </Link>
                <LogoutButton />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Sistema Activo</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <DashboardStats
              title="Total Maquinarias"
              value={totalMachinery}
              icon={<Gauge className="h-5 w-5" />}
              description={`${operationalCount} operacionales`}
              trend="neutral"
            />
            <DashboardStats
              title="Alertas Activas"
              value={activeAlerts}
              icon={<AlertTriangle className="h-5 w-5" />}
              description={`${warningCount} maquinarias en advertencia`}
              trend={activeAlerts > 0 ? "down" : "neutral"}
            />
            <DashboardStats
              title="Órdenes Pendientes"
              value={pendingOrders}
              icon={<Wrench className="h-5 w-5" />}
              description={`${maintenanceCount} en mantenimiento`}
              trend="neutral"
            />
            <DashboardStats
              title="Eficiencia"
              value={`${Math.round((operationalCount / totalMachinery) * 100)}%`}
              icon={<Activity className="h-5 w-5" />}
              description="Disponibilidad operativa"
              trend={operationalCount / totalMachinery > 0.8 ? "up" : "down"}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse" />}>
              <SensorMonitoringDashboard />
            </Suspense>
            <MachineryStatus machinery={machinery || []} />
          </div>

          {/* Bottom Grid */}
          <div className="grid gap-6 lg:grid-cols-1">
            <MaintenanceSchedule orders={orders || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
