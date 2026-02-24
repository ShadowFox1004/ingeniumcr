import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Wrench, LineChart, BellRing } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20" />
            <div className="leading-tight">
              <div className="font-bold">IngeniumCR</div>
              <div className="text-xs text-muted-foreground">Mantenimiento Industrial</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>
                Solicitar acceso
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-6">
          <section className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                Monitoreo, alertas y planificación de mantenimiento
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Reduce paradas.
                <span className="text-primary"> Aumenta disponibilidad.</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
                IngeniumCR centraliza el estado de tus equipos, mantenimiento preventivo y alertas operativas para que tu
                operación industrial se mantenga estable y medible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="w-full sm:w-auto">
                    Ver demo / Empezar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 max-w-lg">
                <div className="rounded-xl border border-border/60 bg-card/50 p-4">
                  <div className="text-2xl font-bold">+20%</div>
                  <div className="text-xs text-muted-foreground">Mejor visibilidad operativa</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/50 p-4">
                  <div className="text-2xl font-bold">-30%</div>
                  <div className="text-xs text-muted-foreground">Tiempo en respuesta a alertas</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <BellRing className="h-4 w-4 text-primary" />
                    Alertas en tiempo real
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Detecta anomalías y prioriza lo crítico.</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <Wrench className="h-4 w-4 text-primary" />
                    Órdenes de trabajo
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Planifica mantenimiento preventivo y correctivo.</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <LineChart className="h-4 w-4 text-primary" />
                    KPIs y métricas
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Sigue disponibilidad, incidencias y eficiencia.</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Acceso seguro
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Autenticación y control de acceso por usuario.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold">¿Listo para modernizar tu mantenimiento?</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Crea una cuenta o inicia sesión para ver el dashboard y comenzar a registrar equipos, alertas y órdenes.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/auth/sign-up">
                  <Button>Crear cuenta</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Iniciar sesión</Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} IngeniumCR</div>
            <div>Operación industrial con visibilidad y control.</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
