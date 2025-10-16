import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { MachineryStatus } from "@/components/machinery-status"
import { MaintenanceSchedule } from "@/components/maintenance-schedule"
import { LogoutButton } from "@/components/logout-button"
import { AlertTriangle, Wrench, Gauge, Settings, Bot, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SensorMonitoringDashboard } from "@/components/sensor-monitoring-dashboard"
import Image from "next/image"

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
        <header className="border-b border-border/40 bg-card/80 backdrop-blur-xl shadow-lg">
          <div className="container mx-auto px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20">
                    <Image src="/images/cr-logo.jpg" alt="CR Logo" fill className="object-cover" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                      IngeniumCR
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium">Sistema de Mantenimiento Industrial</p>
                  </div>
                </div>
              </div>
              <nav className="flex items-center gap-2">
                <Link href="/machinery">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-primary/10">
                    Maquinarias
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-primary/10">
                    Órdenes
                  </Button>
                </Link>
                <Link href="/sensors">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-primary/10">
                    Sensores
                  </Button>
                </Link>
                <Link href="/alerts">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-primary/10">
                    Alertas
                  </Button>
                </Link>
                <div className="h-6 w-px bg-border/50 mx-2" />
                <Link href="/ai-assistant">
                  <Button
                    size="sm"
                    className="font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Asistente IA
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="font-medium">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <LogoutButton />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Sistema Activo</span>
                </div>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-8 py-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense
              fallback={
                <div className="h-[600px] bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 animate-pulse" />
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
