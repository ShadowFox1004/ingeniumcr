import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { MachineryList } from "@/components/machinery-list"
import { MachineryFilters } from "@/components/machinery-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Maquinarias</h1>
              <p className="text-sm text-muted-foreground">{machinery?.length || 0} maquinarias registradas</p>
            </div>
            <Link href="/machinery/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Maquinaria
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Suspense fallback={<div className="h-20 bg-card rounded-lg animate-pulse" />}>
          <MachineryFilters />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse mt-6" />}>
          <MachineryList machinery={machinery || []} />
        </Suspense>
      </main>
    </div>
  )
}
