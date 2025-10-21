import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { MachineryList } from "@/components/machinery-list"
import { MachineryFilters } from "@/components/machinery-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"

export default async function MachineryPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string; search?: string }
}) {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from("machinery").select("*")

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  if (searchParams.type) {
    query = query.eq("type", searchParams.type)
  }

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`)
  }

  const { data: machinery } = await query.order("name", { ascending: true })

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: "url('/images/machinery-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        {/* Global AppHeader */}
        <AppHeader />

        {/* Page Header */}
        <div className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gestión de Maquinarias</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {machinery?.length || 0} maquinarias registradas
                </p>
              </div>
              <Link href="/machinery/new" className="w-full sm:w-auto">
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Nueva Maquinaria
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Suspense fallback={<div className="h-20 bg-card rounded-lg animate-pulse" />}>
            <MachineryFilters />
          </Suspense>
          <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse mt-6" />}>
            <MachineryList machinery={machinery || []} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
