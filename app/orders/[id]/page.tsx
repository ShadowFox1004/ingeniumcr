import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Calendar, User, DollarSign } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: order } = await supabase
    .from("maintenance_orders")
    .select("*, machinery(*)")
    .eq("id", params.id)
    .single()

  if (!order) {
    notFound()
  }

  const priorityColors = {
    baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critica: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusColors = {
    pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    en_progreso: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completada: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelada: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }

  const statusLabels = {
    pendiente: "Pendiente",
    en_progreso: "En Progreso",
    completada: "Completada",
    cancelada: "Cancelada",
  }

  const typeLabels = {
    preventivo: "Mantenimiento Preventivo",
    correctivo: "Mantenimiento Correctivo",
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/orders">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{order.title}</h1>
                <p className="text-sm text-muted-foreground">{typeLabels[order.type]}</p>
              </div>
            </div>
            <Link href={`/orders/${params.id}/edit`}>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
              <Badge className={priorityColors[order.priority]}>Prioridad: {order.priority.toUpperCase()}</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Maquinaria</h3>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="font-semibold text-foreground">{order.machinery?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{order.machinery?.type}</p>
                  <p className="text-sm text-muted-foreground">{order.machinery?.location}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Programada</p>
                    <p className="font-medium text-foreground">{formatDate(order.scheduled_date)}</p>
                  </div>
                </div>

                {order.assigned_to && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Asignado a</p>
                      <p className="font-medium text-foreground">{order.assigned_to}</p>
                    </div>
                  </div>
                )}

                {order.cost && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Costo</p>
                      <p className="font-medium text-foreground">
                        ${order.cost.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {order.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h3>
                <p className="text-foreground">{order.description}</p>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Adicional</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                <p className="text-foreground font-medium mt-1">{formatDate(order.created_at)}</p>
              </div>
              {order.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Completado</p>
                  <p className="text-foreground font-medium mt-1">{formatDate(order.completed_at)}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
