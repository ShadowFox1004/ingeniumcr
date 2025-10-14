import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  tool,
  type UIDataTypes,
  type UIMessage,
  validateUIMessages,
} from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const getMachineryStatusTool = tool({
  description: "Get the current status and details of all machinery in the system",
  inputSchema: z.object({}),
  async execute() {
    const supabase = await createClient()
    const { data: machinery } = await supabase.from("machinery").select("*").order("name")

    return {
      machinery: machinery || [],
      summary: `Found ${machinery?.length || 0} machines in the system`,
    }
  },
})

const getActiveSensorsTool = tool({
  description: "Get real-time sensor readings from all active sensors",
  inputSchema: z.object({
    machineryId: z.number().optional().describe("Filter by specific machinery ID"),
  }),
  async execute({ machineryId }) {
    const supabase = await createClient()
    let query = supabase.from("sensors").select("*, machinery(name)").order("last_reading_time", { ascending: false })

    if (machineryId) {
      query = query.eq("machinery_id", machineryId)
    }

    const { data: sensors } = await query

    return {
      sensors: sensors || [],
      summary: `Found ${sensors?.length || 0} sensors${machineryId ? ` for machinery ID ${machineryId}` : ""}`,
    }
  },
})

const getActiveAlertsTool = tool({
  description: "Get all active alerts and warnings in the system",
  inputSchema: z.object({
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  }),
  async execute({ severity }) {
    const supabase = await createClient()
    let query = supabase
      .from("alerts")
      .select("*, machinery(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (severity) {
      query = query.eq("severity", severity)
    }

    const { data: alerts } = await query

    return {
      alerts: alerts || [],
      summary: `Found ${alerts?.length || 0} active alerts${severity ? ` with ${severity} severity` : ""}`,
    }
  },
})

const analyzeMachineryHealthTool = tool({
  description: "Analyze the health status of a specific machinery based on sensor data and alerts",
  inputSchema: z.object({
    machineryId: z.number().describe("The ID of the machinery to analyze"),
  }),
  async execute({ machineryId }) {
    const supabase = await createClient()

    // Get machinery details
    const { data: machinery } = await supabase.from("machinery").select("*").eq("id", machineryId).single()

    // Get recent sensor readings
    const { data: sensors } = await supabase.from("sensors").select("*").eq("machinery_id", machineryId)

    // Get active alerts
    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("machinery_id", machineryId)
      .eq("status", "active")

    return {
      machinery,
      sensors: sensors || [],
      alerts: alerts || [],
      summary: `Analyzed ${machinery?.name}: ${sensors?.length || 0} sensors, ${alerts?.length || 0} active alerts`,
    }
  },
})

const getMaintenanceOrdersTool = tool({
  description: "Get maintenance orders and their status",
  inputSchema: z.object({
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
    machineryId: z.number().optional(),
  }),
  async execute({ status, machineryId }) {
    const supabase = await createClient()
    let query = supabase
      .from("maintenance_orders")
      .select("*, machinery(name)")
      .order("scheduled_date", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }
    if (machineryId) {
      query = query.eq("machinery_id", machineryId)
    }

    const { data: orders } = await query

    return {
      orders: orders || [],
      summary: `Found ${orders?.length || 0} maintenance orders`,
    }
  },
})

const createMaintenanceRecommendationTool = tool({
  description: "Create a maintenance recommendation based on analysis",
  inputSchema: z.object({
    machineryId: z.number(),
    recommendation: z.string().describe("The maintenance recommendation"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    estimatedCost: z.number().optional(),
  }),
  async execute({ machineryId, recommendation, priority, estimatedCost }) {
    return {
      success: true,
      recommendation: {
        machineryId,
        recommendation,
        priority,
        estimatedCost,
        createdAt: new Date().toISOString(),
      },
      summary: `Created ${priority} priority recommendation for machinery ID ${machineryId}`,
    }
  },
})

const tools = {
  getMachineryStatus: getMachineryStatusTool,
  getActiveSensors: getActiveSensorsTool,
  getActiveAlerts: getActiveAlertsTool,
  analyzeMachineryHealth: analyzeMachineryHealthTool,
  getMaintenanceOrders: getMaintenanceOrdersTool,
  createMaintenanceRecommendation: createMaintenanceRecommendationTool,
} as const

export type AIChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<AIChatMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: "openai/gpt-5",
    system: `Eres un asistente de IA especializado en mantenimiento industrial para IngeniumCR (Central Romana Corporation). 
    
Tu rol es:
1. Analizar el estado de las maquinarias usando los datos de sensores y alertas
2. Proporcionar recomendaciones de mantenimiento preventivo y correctivo
3. Ayudar a los técnicos a diagnosticar problemas
4. Priorizar tareas de mantenimiento basándose en criticidad
5. Responder preguntas sobre el sistema de mantenimiento

Cuando analices maquinarias:
- Revisa los valores de los sensores (temperatura, vibración, presión)
- Identifica patrones anormales o tendencias preocupantes
- Considera las alertas activas y su severidad
- Evalúa el historial de mantenimiento
- Proporciona recomendaciones específicas y accionables

Siempre responde en español de manera profesional y técnica, pero clara.`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
