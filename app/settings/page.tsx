import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ThemeSelector } from "@/components/theme-selector"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { UserProfileSettings } from "@/components/user-profile-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, User, Bell, Shield, Monitor } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground">Personaliza tu experiencia</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Perfil de Usuario</CardTitle>
              </div>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded" />}>
                <UserProfileSettings user={user} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Dark Mode Toggle Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <CardTitle>Apariencia</CardTitle>
              </div>
              <CardDescription>Ajusta el modo de visualización</CardDescription>
            </CardHeader>
            <CardContent>
              <DarkModeToggle />
            </CardContent>
          </Card>

          {/* Theme Customization Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Tema de Color</CardTitle>
              </div>
              <CardDescription>Personaliza los colores del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notificaciones</CardTitle>
              </div>
              <CardDescription>Configura tus preferencias de alertas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Maquinaria</p>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones de fallos</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Órdenes de Mantenimiento</p>
                    <p className="text-sm text-muted-foreground">Notificaciones de nuevas órdenes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sensores Críticos</p>
                    <p className="text-sm text-muted-foreground">Alertas de valores anormales</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Seguridad</CardTitle>
              </div>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Cambiar Contraseña</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Actualiza tu contraseña regularmente para mantener tu cuenta segura
                  </p>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
                    Cambiar Contraseña
                  </button>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="font-medium mb-2">Sesiones Activas</p>
                  <p className="text-sm text-muted-foreground">
                    Última sesión: {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
