import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AlertsList } from "@/components/alerts-list"
import { AlertsFilters } from "@/components/alerts-filters"
import { BackToDashboardButton } from "@/components/back-to-dashboard-button"

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: { severity?: string; status?: string }
}) {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from("alerts").select("*, machinery(name, type, location), sensor:sensors(name, sensor_type)")

  if (searchParams.severity) {
    query = query.eq("severity", searchParams.severity)
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  const { data: alerts } = await query.order("created_at", { ascending: false })

  const activeCount = alerts?.filter((a) => a.status === "active").length || 0
  const criticalCount = alerts?.filter((a) => a.severity === "critical" && a.status === "active").length || 0

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: "url('/images/alerts-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        {/* Page Header */}
        <div className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="mb-4">
              <BackToDashboardButton />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Sistema de Alertas</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeCount} alertas activas • {criticalCount} críticas
              </p>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Suspense fallback={<div className="h-20 bg-card rounded-lg animate-pulse" />}>
            <AlertsFilters />
          </Suspense>
          <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse mt-6" />}>
            <AlertsList alerts={alerts || []} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
