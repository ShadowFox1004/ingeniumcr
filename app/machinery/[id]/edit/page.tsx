import { getSupabaseServerClient } from "@/lib/supabase/server"
import { MachineryForm } from "@/components/machinery-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditMachineryPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: machinery } = await supabase.from("machinery").select("*").eq("id", params.id).single()

  if (!machinery) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/machinery/${params.id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Maquinaria</h1>
              <p className="text-sm text-muted-foreground">{machinery.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <MachineryForm machinery={machinery} />
      </main>
    </div>
  )
}
