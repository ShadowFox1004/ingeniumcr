import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SensorForm } from "@/components/sensor-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditSensorPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const [{ data: sensor }, { data: machinery }] = await Promise.all([
    supabase.from("sensors").select("*").eq("id", params.id).single(),
    supabase.from("machinery").select("*").order("name"),
  ])

  if (!sensor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/sensors/${params.id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Sensor</h1>
              <p className="text-sm text-muted-foreground">{sensor.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <SensorForm sensor={sensor} machinery={machinery || []} />
      </main>
    </div>
  )
}
