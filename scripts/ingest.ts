// Cargar variables de entorno primero
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Verificación de variables
console.log("🔍 Variables de entorno cargadas:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅" : "❌");
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "✅" : "❌");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅" : "❌");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.OPENAI_API_KEY) {
  console.error("❌ Faltan variables de entorno necesarias");
  process.exit(1);
}

// Configuración de clientes
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interfaz para el documento
interface DocumentMetadata {
  source: string;
  type: string;
  uploaded_at: string;
  [key: string]: any;
}

// Función para generar embeddings
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al generar embedding:', errorMessage);
    throw new Error(`Error al generar embedding: ${errorMessage}`);
  }
}

// Función para cargar un documento
async function ingestDocument(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    console.log(`Procesando: ${fileName}...`);
    const embedding = await getEmbedding(content);
    
    const metadata: DocumentMetadata = { 
      source: fileName,
      type: path.extname(filePath).slice(1),
      uploaded_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('documents')
      .insert([{
        content,
        metadata,
        embedding
      }]);

    if (error) throw error;
    console.log(`✅ Documento ${fileName} cargado exitosamente`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`❌ Error al cargar ${filePath}:`, errorMessage);
  }
}

// Función principal
async function main() {
  // Lista de archivos a cargar
  const filesToIngest = [
    './styles/documentos/manual_operacion.txt',
    './styles/documentos/mantenimiento.txt',
    './styles/documentos/seguridad.txt',
    './styles/documentos/maquinaria.txt'
  ];

  try {
    for (const file of filesToIngest) {
      try {
        await ingestDocument(file);
      } catch (error) {
        console.error(`Error procesando ${file}:`, error);
      }
    }
    console.log('✅ Proceso de carga completado');
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error);
    process.exit(1);
  }
}

// Ejecutar
main().catch(error => {
  console.error('Error no manejado:', error);
  process.exit(1);
});