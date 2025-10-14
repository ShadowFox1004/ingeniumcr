import { AIChat } from "@/components/ai-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackToDashboardButton } from "@/components/back-to-dashboard-button"
import { Bot, Sparkles } from "lucide-react"

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{
          backgroundImage:
            "url(/placeholder.svg?height=1080&width=1920&query=AI technology neural network digital brain)",
        }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToDashboardButton />
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Asistente de IA</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Powered by GPT-5</span>
            </div>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Chat con el Asistente</CardTitle>
                  <CardDescription>
                    Interactúa con la IA para analizar maquinarias y obtener recomendaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIChat />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ejemplos de Consultas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-primary">Análisis General:</p>
                    <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                      <li>• "¿Cuál es el estado actual de todas las maquinarias?"</li>
                      <li>• "Muéstrame las alertas activas"</li>
                      <li>• "¿Qué sensores están reportando valores anormales?"</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <p className="font-medium text-primary">Análisis Específico:</p>
                    <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                      <li>• "Analiza la salud del Molino Principal #1"</li>
                      <li>• "¿Qué mantenimiento necesita la Bomba de Agua #1?"</li>
                      <li>• "Revisa los sensores de la Caldera #1"</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <p className="font-medium text-primary">Recomendaciones:</p>
                    <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                      <li>• "Dame recomendaciones de mantenimiento preventivo"</li>
                      <li>• "¿Qué maquinarias requieren atención urgente?"</li>
                      <li>• "Prioriza las tareas de mantenimiento"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Capacidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Acceso en tiempo real a datos de sensores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Análisis de salud de maquinarias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Evaluación de alertas y criticidad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Recomendaciones de mantenimiento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Consulta de órdenes de trabajo</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
