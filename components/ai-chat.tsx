"use client"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Loader2, Wrench, Activity, AlertTriangle, ClipboardList, Lightbulb, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

const STORAGE_KEY = "ingeniumcr_chat_history"
const EXPIRATION_HOURS = 24

interface StoredChat {
  messages: any[]
  timestamp: number
}

function loadChatHistory() {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const data: StoredChat = JSON.parse(stored)
    const now = Date.now()
    const expirationTime = EXPIRATION_HOURS * 60 * 60 * 1000

    // Check if chat history has expired
    if (now - data.timestamp > expirationTime) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }

    return data.messages
  } catch (error) {
    console.error("[v0] Error loading chat history:", error)
    return []
  }
}

function saveChatHistory(messages: any[]) {
  if (typeof window === "undefined") return

  try {
    const data: StoredChat = {
      messages,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("[v0] Error saving chat history:", error)
  }
}

function clearChatHistory() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function AIChat() {
  const [mounted, setMounted] = useState(false)

  const initialMessages = mounted ? loadChatHistory() : []

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/ai-chat",
    initialMessages,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && messages.length > 0) {
      saveChatHistory(messages)
    }
  }, [messages, mounted])

  const handleClearChat = () => {
    setMessages([])
    clearChatHistory()
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      {messages.length > 0 && (
        <div className="p-2 border-b flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar conversación
          </Button>
        </div>
      )}

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
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 mr-12">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {message.toolInvocations?.map((tool: any, index: number) => (
                        <div key={index} className="text-xs bg-muted/30 p-3 rounded border border-border/50">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            {getToolIcon(tool.toolName)}
                            <span className="font-medium">{getToolLabel(tool.toolName)}</span>
                          </div>
                          {tool.result && (
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(tool.result, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}

          {isLoading && (
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
            value={input}
            onChange={handleInputChange}
            placeholder="Pregunta sobre el sistema de mantenimiento..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
