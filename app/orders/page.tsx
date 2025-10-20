import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { OrdersList } from "@/components/orders-list"
import { OrdersFilters } from "@/components/orders-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { BackToDashboardButton } from "@/components/back-to-dashboard-button"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string; type?: string }
}) {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from("maintenance_orders").select("*, machinery(name, type, location)")

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  if (searchParams.priority) {
    query = query.eq("priority", searchParams.priority)
  }

  if (searchParams.type) {
    query = query.eq("type", searchParams.type)
  }

  const { data: orders } = await query.order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: "url('/images/orders-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        <header className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="mb-4">
              <BackToDashboardButton />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Órdenes de Mantenimiento</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{orders?.length || 0} órdenes registradas</p>
              </div>
              <Link href="/orders/new" className="w-full sm:w-auto">
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Nueva Orden
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Suspense fallback={<div className="h-20 bg-card rounded-lg animate-pulse" />}>
            <OrdersFilters />
          </Suspense>
          <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse mt-6" />}>
            <OrdersList orders={orders || []} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
