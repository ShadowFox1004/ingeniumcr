import { getSupabaseServerClient } from "@/lib/supabase/server"
import { OrderForm } from "@/components/order-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewOrderPage() {
  const supabase = await getSupabaseServerClient()
  const { data: machinery } = await supabase.from("machinery").select("*").order("name")

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nueva Orden de Mantenimiento</h1>
              <p className="text-sm text-muted-foreground">Crear nueva orden de trabajo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <OrderForm machinery={machinery || []} />
      </main>
    </div>
  )
}
