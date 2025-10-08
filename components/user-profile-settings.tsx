"use client"

import type { User } from "@supabase/supabase-js"
import { Mail, Calendar } from "lucide-react"

export function UserProfileSettings({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{user.email?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="font-medium text-lg">{user.email?.split("@")[0]}</p>
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
