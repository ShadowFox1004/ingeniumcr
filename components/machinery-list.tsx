import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import type { Machinery } from "@/lib/types"

interface MachineryListProps {
  machinery: Machinery[]
}

export function MachineryList({ machinery }: MachineryListProps) {
  const statusColors = {
    operational: "bg-green-500/10 text-green-500 border-green-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    offline: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusLabels = {
    operational: "Operacional",
    maintenance: "Mantenimiento",
    warning: "Advertencia",
    offline: "Fuera de Línea",
  }

  if (machinery.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center mt-6">
        <p className="text-muted-foreground">No se encontraron maquinarias</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 mt-6">
      {machinery.map((machine) => (
        <Card key={machine.id} className="p-4 sm:p-6 bg-card border-border hover:bg-secondary/50 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{machine.name}</h3>
                <Badge className={statusColors[machine.status]}>{statusLabels[machine.status]}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="text-foreground font-medium">{machine.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ubicación</p>
                  <p className="text-foreground font-medium">{machine.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Instalación</p>
                  <p className="text-foreground font-medium">
                    {new Date(machine.installation_date).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Último Mantenimiento</p>
                  <p className="text-foreground font-medium">
                    {machine.last_maintenance ? new Date(machine.last_maintenance).toLocaleDateString("es-DO") : "N/A"}
                  </p>
                </div>
              </div>
              {machine.description && <p className="text-sm text-muted-foreground mt-3">{machine.description}</p>}
            </div>
            <div className="flex sm:flex-col gap-2">
              <Link href={`/machinery/${machine.id}`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="icon" className="w-full sm:w-auto bg-transparent">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/machinery/${machine.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="icon" className="w-full sm:w-auto bg-transparent">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive bg-transparent w-full sm:w-auto flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
