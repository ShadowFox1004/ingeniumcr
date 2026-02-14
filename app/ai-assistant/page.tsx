import { AIChat } from "@/components/ai-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AIAssistantPage() {
  return (
    <div className="h-screen bg-muted/40 flex flex-col overflow-hidden">
      
      <main className="flex-1 w-full px-6 py-6 overflow-hidden">
        
        <div className="flex gap-6 h-full overflow-hidden">
          
          {/* Chat */}
          <div className="flex-[4] flex overflow-hidden">
    <Card className="flex flex-col h-[calc(100%-4rem)] w-full overflow-hidden">
              
              <CardHeader className="border-b shrink-0">
                <CardTitle>Chat con el Asistente</CardTitle>
                <CardDescription>
                  Interactúa con la IA para analizar maquinarias y obtener recomendaciones
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
                <AIChat />
              </CardContent>

            </Card>
          </div>

          {/* Side Panel */}
          <div className="flex-[1.2] max-w-md space-y-6 overflow-y-auto">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Ejemplos de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Análisis General:
                  </p>
                  <ul className="space-y-1 ml-4 text-xs text-muted-foreground list-disc">
                    <li>¿Cuál es el estado actual de todas las maquinarias?</li>
                    <li>Muéstrame las alertas activas</li>
                    <li>¿Qué sensores están reportando valores anormales?</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Análisis Específico:
                  </p>
                  <ul className="space-y-1 ml-4 text-xs text-muted-foreground list-disc">
                    <li>Analiza la salud del Molino Principal #1</li>
                    <li>¿Qué mantenimiento necesita la Bomba de Agua #1?</li>
                    <li>Revisa los sensores de la Caldera #1</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Recomendaciones:
                  </p>
                  <ul className="space-y-1 ml-4 text-xs text-muted-foreground list-disc">
                    <li>Dame recomendaciones de mantenimiento preventivo</li>
                    <li>¿Qué maquinarias requieren atención urgente?</li>
                    <li>Prioriza las tareas de mantenimiento</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Capacidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
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
  )
}
