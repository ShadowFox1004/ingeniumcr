import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AlertsList } from "@/components/alerts-list"
import { AlertsFilters } from "@/components/alerts-filters"
import { BackToDashboardButton } from "@/components/back-to-dashboard-button"
import { MobileNav } from "@/components/mobile-nav"
import Image from "next/image"

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
        <header className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-lg">
                  <Image src="/images/cr-logo.jpg" alt="CR Logo" fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">IngeniumCR</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Sistema de Mantenimiento Industrial</p>
                </div>
              </div>
              <MobileNav />
            </div>
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
        </header>

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
