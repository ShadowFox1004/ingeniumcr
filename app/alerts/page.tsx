import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AlertsList } from "@/components/alerts-list"
import { AlertsFilters } from "@/components/alerts-filters"

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
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sistema de Alertas</h1>
              <p className="text-sm text-muted-foreground">
                {activeCount} alertas activas • {criticalCount} críticas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Suspense fallback={<div className="h-20 bg-card rounded-lg animate-pulse" />}>
          <AlertsFilters />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse mt-6" />}>
          <AlertsList alerts={alerts || []} />
        </Suspense>
      </main>
    </div>
  )
}
