"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import type { AIChatMessage } from "@/app/api/ai-chat/route"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Loader2, Wrench, Activity, AlertTriangle, ClipboardList, Lightbulb } from "lucide-react"
import { useState } from "react"

export function AIChat() {
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status } = useChat<AIChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "getMachineryStatus":
        return <Wrench className="h-4 w-4" />
      case "getActiveSensors":
        return <Activity className="h-4 w-4" />
      case "getActiveAlerts":
        return <AlertTriangle className="h-4 w-4" />
      case "analyzeMachineryHealth":
        return <Activity className="h-4 w-4" />
      case "getMaintenanceOrders":
        return <ClipboardList className="h-4 w-4" />
      case "createMaintenanceRecommendation":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Wrench className="h-4 w-4" />
    }
  }

  const getToolLabel = (toolName: string) => {
    const labels: Record<string, string> = {
      getMachineryStatus: "Consultando estado de maquinarias",
      getActiveSensors: "Leyendo sensores activos",
      getActiveAlerts: "Revisando alertas activas",
      analyzeMachineryHealth: "Analizando salud de maquinaria",
      getMaintenanceOrders: "Consultando órdenes de mantenimiento",
      createMaintenanceRecommendation: "Creando recomendación",
    }
    return labels[toolName] || toolName
  }

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Asistente de IA - IngeniumCR</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Hola, soy tu asistente de mantenimiento inteligente. Puedo ayudarte a:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Analizar el estado de las maquinarias</li>
                    <li>• Revisar lecturas de sensores en tiempo real</li>
                    <li>• Evaluar alertas activas y su criticidad</li>
                    <li>• Proporcionar recomendaciones de mantenimiento</li>
                    <li>• Consultar órdenes de trabajo</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Pregúntame cualquier cosa sobre el sistema de mantenimiento.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {message.role === "user" ? (
                <Card className="p-4 bg-primary/5 border-primary/20 ml-12">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <p key={index} className="text-sm whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 mr-12">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-3">
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <p key={index} className="text-sm whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        }

                        // Handle tool calls
                        if (part.type.startsWith("tool-")) {
                          const toolName = part.type.replace("tool-", "")

                          if (part.state === "input-available" || part.state === "input-streaming") {
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded"
                              >
                                {getToolIcon(toolName)}
                                <span>{getToolLabel(toolName)}...</span>
                                <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                              </div>
                            )
                          }

                          if (part.state === "output-available") {
                            return (
                              <div key={index} className="text-xs bg-muted/30 p-3 rounded border border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                  {getToolIcon(toolName)}
                                  <span className="font-medium">{getToolLabel(toolName)}</span>
                                </div>
                                <pre className="text-xs overflow-x-auto">{JSON.stringify(part.output, null, 2)}</pre>
                              </div>
                            )
                          }

                          if (part.state === "output-error") {
                            return (
                              <div key={index} className="text-xs bg-destructive/10 text-destructive p-2 rounded">
                                Error: {part.errorText}
                              </div>
                            )
                          }
                        }

                        return null
                      })}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}

          {status === "in_progress" && messages[messages.length - 1]?.role === "user" && (
            <Card className="p-4 mr-12">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analizando...</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregunta sobre el sistema de mantenimiento..."
            disabled={status === "in_progress"}
            className="flex-1"
          />
          <Button type="submit" disabled={status === "in_progress" || !inputValue.trim()}>
            {status === "in_progress" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
