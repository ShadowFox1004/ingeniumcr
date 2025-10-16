import { streamText, tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const tools = {
  getMachineryStatus: tool({
    description: "Get the current status and details of all machinery in the system",
    parameters: z.object({}),
    execute: async () => {
      const supabase = await createClient()
      const { data: machinery } = await supabase.from("machinery").select("*").order("name")

      return {
        machinery: machinery || [],
        summary: `Found ${machinery?.length || 0} machines in the system`,
      }
    },
  }),

  getActiveSensors: tool({
    description: "Get real-time sensor readings from all active sensors",
    parameters: z.object({
      machineryId: z.number().optional().describe("Filter by specific machinery ID"),
    }),
    execute: async ({ machineryId }) => {
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
  }),

  getActiveAlerts: tool({
    description: "Get all active alerts and warnings in the system",
    parameters: z.object({
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    }),
    execute: async ({ severity }) => {
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
  }),

  analyzeMachineryHealth: tool({
    description: "Analyze the health status of a specific machinery based on sensor data and alerts",
    parameters: z.object({
      machineryId: z.number().describe("The ID of the machinery to analyze"),
    }),
    execute: async ({ machineryId }) => {
      const supabase = await createClient()

      const { data: machinery } = await supabase.from("machinery").select("*").eq("id", machineryId).single()
      const { data: sensors } = await supabase.from("sensors").select("*").eq("machinery_id", machineryId)
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
  }),

  getMaintenanceOrders: tool({
    description: "Get maintenance orders and their status",
    parameters: z.object({
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      machineryId: z.number().optional(),
    }),
    execute: async ({ status, machineryId }) => {
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
  }),
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: "alibaba/qwen-3-14b",
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
    messages,
    tools,
    maxSteps: 5,
  })

  return result.toDataStreamResponse()
}
