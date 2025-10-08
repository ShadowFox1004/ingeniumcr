"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Alert } from "@/lib/types"

interface AlertActionsProps {
  alert: Alert
}

export function AlertActions({ alert }: AlertActionsProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleAcknowledge = async () => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("alerts").update({ status: "acknowledged" }).eq("id", alert.id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo reconocer la alerta",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Alerta reconocida",
        description: "La alerta ha sido marcada como reconocida",
      })
      router.refresh()
    }
  }

  const handleResolve = async () => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from("alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", alert.id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta",
      })
      router.refresh()
    }
  }

  if (alert.status === "resolved") {
    return null
  }

  return (
    <div className="flex gap-2">
      {alert.status === "active" && (
        <Button variant="outline" onClick={handleAcknowledge} className="gap-2 bg-transparent">
          <Check className="h-4 w-4" />
          Reconocer
        </Button>
      )}
      <Button onClick={handleResolve} className="gap-2">
        <Check className="h-4 w-4" />
        Resolver
      </Button>
    </div>
  )
}
