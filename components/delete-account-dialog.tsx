"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function DeleteAccountDialog() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDeleteAccount = async () => {
    if (confirmText !== "ELIMINAR") {
      toast.error("Por favor escribe 'ELIMINAR' para confirmar")
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No se encontró el usuario")
        return
      }

      // Delete user account from Supabase Auth
      const { error } = await supabase.rpc("delete_user")

      if (error) {
        // If RPC doesn't exist, try direct auth deletion
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

        if (authError) {
          throw authError
        }
      }

      // Sign out
      await supabase.auth.signOut()

      toast.success("Cuenta eliminada exitosamente")

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Error al eliminar la cuenta. Por favor contacta al soporte.")
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar Cuenta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="font-semibold text-foreground">Esta acción es permanente e irreversible.</p>
            <p>Al eliminar tu cuenta:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Se eliminarán todos tus datos personales</li>
              <li>Perderás acceso a todas las órdenes de mantenimiento</li>
              <li>Se borrarán tus configuraciones y preferencias</li>
              <li>No podrás recuperar esta información</li>
            </ul>
            <div className="pt-4">
              <Label htmlFor="confirm-delete" className="text-foreground">
                Escribe <span className="font-bold text-destructive">ELIMINAR</span> para confirmar:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="mt-2"
                disabled={isDeleting}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmText !== "ELIMINAR"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar Permanentemente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
