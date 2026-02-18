import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
// import OpenAI from 'openai';

// Función para obtener el cliente de Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");
  return new Groq({ apiKey });
}
// // Función para obtener el cliente de OpenAI
// function getOpenAIClient() {
//   const openaiApiKey = process.env.OPENAI_API_KEY;
//   if (!openaiApiKey) {
//     throw new Error('The OPENAI_API_KEY environment variable is missing or empty');
//   }
//   return new OpenAI({ apiKey: openaiApiKey });
// }

// Función para generar embeddings
async function getEmbedding(text: string) {
  const groq = getGroqClient();
  // const openai = getOpenAIClient();
  const response = await groq.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// Interfaz para los documentos
interface Document {
  id: number;
  content: string;
  metadata: {
    source: string;
    [key: string]: any;
  };
  similarity?: number;
}

type AnalysisType =
  | "estado_general"
  | "alertas_activas"
  | "sensores_anormales"
  | "desconocido";

function detectAnalysisType(question: string): AnalysisType {
  const q = question.toLowerCase();

  if (q.includes("estado actual") || q.includes("todas las maquinarias")) {
    return "estado_general";
  }

  if (q.includes("alertas activas") || q.includes("alertas")) {
    return "alertas_activas";
  }

  if (q.includes("sensor") || q.includes("sensores")) {
    return "sensores_anormales";
  }

  return "desconocido";
}

// Función para buscar documentos similares
async function searchDocuments(query: string, limit = 3): Promise<Document[]> {
  return [];
}
//   const embedding = await getEmbedding(query);
//   const supabase = getSupabaseClient();
  
//   const { data: documents, error } = await supabase.rpc('match_documents', {
//     query_embedding: embedding,
//     match_threshold: 0.5,
//     match_count: limit
//   });

//   if (error) {
//     console.error('Error searching documents:', error);
//     return [];
//   }

//   return documents || [];
// }

async function getMachinesStatusSummary() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("machinery")
    .select("id, name, type, location, status")
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Error fetching machinery status:", error);
    return "No se pudo obtener la información de las maquinarias.";
  }

  if (data.length === 0) {
    return "No hay maquinarias registradas en el sistema.";
  }

  return [
    "[ESTADO GENERAL DE MAQUINARIAS]",
    ...data.map(
      (m) =>
        `Máquina: ${m.name} | Tipo: ${m.type ?? "N/A"} | Ubicación: ${
          m.location ?? "N/A"
        } | Estado: ${m.status ?? "desconocido"}`
    ),
  ].join("\n");
}

async function getActiveAlertsSummary() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("alerts")
    .select(
      "id, machinery_id, alert_type, severity, message, status, created_at"
    )
    .eq("status", "active") // ajusta si usas otro valor
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error("Error fetching alerts:", error);
    return "No se pudo obtener la información de alertas.";
  }

  if (data.length === 0) {
    return "Actualmente no hay alertas activas en el sistema.";
  }

  return [
    "[ALERTAS ACTIVAS]",
    ...data.map(
      (a) =>
        `Alerta: ${a.alert_type ?? "N/A"} | Severidad: ${
          a.severity ?? "N/A"
        } | Máquina ID: ${a.machinery_id ?? "N/A"} | Mensaje: ${
          a.message ?? ""
        } | Creada: ${a.created_at ?? "N/A"}`
    ),
  ].join("\n");
}

export async function POST(req: Request) {
  console.log("=== AI Chat API Called ===");
  
  try {
    // Log environment variables (sin mostrar valores sensibles)
    console.log("Environment check:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "..."
    });

    const { messages } = await req.json();
    console.log("Messages received:", messages.length);
    
    // Verificar credenciales
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.GROQ_API_KEY) {
      console.log("Missing environment variables detected");
      return NextResponse.json({ 
        response: {
          role: "assistant",
          content: "⚠️ Configuración incompleta. Faltan variables de entorno en Vercel. Necesitas: GROQ_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
        } 
      });
    }
 
    const lastMessage = messages[messages.length - 1]?.content || "";

    const analysisType = detectAnalysisType(lastMessage);

const contextParts: string[] = [];

if (analysisType === "estado_general") {
  contextParts.push(await getMachinesStatusSummary());
}

if (analysisType === "alertas_activas") {
  contextParts.push(await getActiveAlertsSummary());
}

// RAG/documentos – por ahora searchDocuments() devuelve []
const relevantDocs = await searchDocuments(lastMessage);
if (relevantDocs.length > 0) {
  const ragContext = relevantDocs
    .map(
      (doc: Document) =>
        `Documento: ${doc.content}\nFuente: ${
          doc.metadata?.source || "Desconocida"
        }`
    )
    .join("\n\n");
  contextParts.push("[DOCUMENTACIÓN RELEVANTE]", ragContext);
}

const context = contextParts.join("\n\n");

    // 1. Buscar documentos relevantes
    // const relevantDocs = await searchDocuments(lastMessage);
    
    // 2. Crear el contexto
    // const context = relevantDocs
    //   .map((doc: Document) => `Documento: ${doc.content}\nFuente: ${doc.metadata?.source || 'Desconocida'}`)
    //   .join('\n\n');

    // 3. Generar respuesta con el contexto
    const groq = getGroqClient();
const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: `Eres un asistente de mantenimiento industrial.
      Usa la siguiente información para responder. Si no sabes la respuesta, di que no tienes suficiente información.

      Información del contexto:
      ${context}`,
    },
    { role: "user", content: lastMessage },
  ],
  temperature: 0.7,
});

const answer = completion.choices[0]?.message?.content ?? "No se pudo obtener una respuesta";

    return NextResponse.json({ 
      response: {
        role: "assistant",
        content: answer
      } 
    });

  } catch (error) {
    console.error("Error en la ruta /api/ai-chat:", error);
    return NextResponse.json(
      { 
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
