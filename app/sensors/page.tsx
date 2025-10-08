import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SensorsList } from "@/components/sensors-list"
import { SensorsFilters } from "@/components/sensors-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { BackToDashboardButton } from "@/components/back-to-dashboard-button"

export default async function SensorsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; machinery?: string }
}) {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from("sensors").select("*, machinery(name, type, location)")

  if (searchParams.type) {
    query = query.eq("sensor_type", searchParams.type)
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  if (searchParams.machinery) {
    query = query.eq("machinery_id", searchParams.machinery)
  }

  const { data: sensors } = await query.order("name", { ascending: true })
  const { data: machinery } = await supabase.from("machinery").select("id, name").order("name")

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="mb-4">
            <BackToDashboardButton />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Monitoreo de Sensores</h1>
              <p className="text-sm text-muted-foreground">{sensors?.length || 0} sensores registrados</p>
            </div>
            <Link href="/sensors/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Sensor
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Suspense fallback={<div className="h-20 bg-card rounded-lg animate-pulse" />}>
          <SensorsFilters machinery={machinery || []} />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse mt-6" />}>
          <SensorsList sensors={sensors || []} />
        </Suspense>
      </main>
    </div>
  )
}
