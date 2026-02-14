import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Función para generar embeddings
async function getEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}
// Verificar credenciales al inicio
if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error('Faltan variables de entorno necesarias:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    hasOpenaiKey: !!openaiApiKey
  });
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

// Función para buscar documentos similares
async function searchDocuments(query: string, limit = 3): Promise<Document[]> {
  const embedding = await getEmbedding(query);
  
  const { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit
  });

  if (error) {
    console.error('Error searching documents:', error);
    return [];
  }

  return documents || [];
}

export async function POST(req: Request) {
  try {
    // Verificar credenciales
    if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
      throw new Error('Configuración incompleta. Verifica las variables de entorno.');
    }
 
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 1. Buscar documentos relevantes
    const relevantDocs = await searchDocuments(lastMessage);
    
    // 2. Crear el contexto
    const context = relevantDocs
      .map((doc: Document) => `Documento: ${doc.content}\nFuente: ${doc.metadata?.source || 'Desconocida'}`)
      .join('\n\n');

    // 3. Generar respuesta con el contexto
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente de mantenimiento industrial. 
          Usa la siguiente información para responder. Si no sabes la respuesta, di que no tienes suficiente información.
          
          Información del contexto:
          ${context}`
        },
        { role: "user", content: lastMessage }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      response: {
        role: "assistant",
        content: completion.choices[0].message.content
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