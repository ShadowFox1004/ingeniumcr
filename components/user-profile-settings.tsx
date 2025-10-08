"use client"

import type { User } from "@supabase/supabase-js"
import { Mail, Calendar, Edit2, Check, X } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function UserProfileSettings({ user }: { user: User }) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [username, setUsername] = useState(user.user_metadata?.username || user.email?.split("@")[0] || "")
  const [tempUsername, setTempUsername] = useState(username)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) {
      setError("El nombre de usuario no puede estar vacío")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: tempUsername.trim() },
      })

      if (updateError) throw updateError

      setUsername(tempUsername.trim())
      setIsEditingName(false)
    } catch (err) {
      setError("Error al actualizar el nombre de usuario")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setTempUsername(username)
    setIsEditingName(false)
    setError("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          {isEditingName ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-lg font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nombre de usuario"
                  disabled={isSaving}
                />
                <button
                  onClick={handleSaveUsername}
                  disabled={isSaving}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-md transition-colors disabled:opacity-50"
                  title="Guardar"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors disabled:opacity-50"
                  title="Cancelar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">{username}</p>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Editar nombre"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Usuario del Sistema</p>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Miembro desde:</span>
          <span className="font-medium">
            {new Date(user.created_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
