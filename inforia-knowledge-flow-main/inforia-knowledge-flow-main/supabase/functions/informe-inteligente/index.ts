import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'

// Function to transcribe audio using OpenRouter
async function transcribeAudioWithOpenRouter(audioFile: File): Promise<string> {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", "openai/whisper-1");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://inforia.app",
        "X-Title": "iNFORiA SaaS",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error calling OpenRouter for transcription:", error);
    throw new Error("Failed to transcribe audio.");
  }
}

// Function to generate report using OpenRouter
async function generateReportWithOpenRouter(transcription: string, sessionNotes: string, previousReport?: string): Promise<string> {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const SYSTEM_PROMPT = `
Eres iNFORiA, un asistente experto en redacción clínica para psicólogos. Tu tarea es redactar un informe clínico estructurado a partir de:

- Las notas del terapeuta
- El resumen de la sesión actual
- Y, si está disponible, el informe clínico anterior

El informe está dirigido a otros profesionales sanitarios. Usa un lenguaje técnico, claro y objetivo, basado únicamente en la información proporcionada y en los protocolos oficiales DSM-5 y CIE-11.
No debes inventar información. Si los datos no son suficientes para establecer hipótesis o diagnósticos, indícalo con claridad.
Tu arquetipo es "El Mentor": combina precisión estructural con sensibilidad clínica.

📄 ESTRUCTURA OBLIGATORIA DEL INFORME (formato Markdown):
1. DATOS DE LA SESIÓN:
   - ID de Paciente: [Ej.: P-03421. Si no consta, escribe "ID no especificado".]
   - Fecha: [Fecha de la sesión. Si no consta, escribe "Fecha no especificada".]
   - Tipo de Sesión: [Selecciona entre: "Primera Visita" o "Seguimiento".]
2. MOTIVO DE CONSULTA / OBJETIVOS DE LA SESIÓN:
   - Resume en una o dos frases el motivo principal de consulta o los objetivos terapéuticos abordados.
3. RESUMEN Y ANÁLISIS DE LA SESIÓN ACTUAL:
   - Resume los temas clave tratados durante la sesión.
   - Incluye verbalizaciones clínicas relevantes del paciente e intervenciones del terapeuta.
   - Centra el análisis únicamente en la información clínica significativa.
4. RESULTADOS DE PRUEBAS PSICOLÓGICAS (SI APLICA):
   - Pruebas aplicadas: [Indica instrumentos utilizados.]
   - Resultados: [Puntuaciones e interpretación cuantitativa/cualitativa.]
   - Traducción diagnóstica: Relaciona los resultados con criterios del DSM-5 y CIE-11.
   - Si no se aplicaron pruebas, escribe: “No se han administrado pruebas en esta sesión.”
5. ANÁLISIS EVOLUTIVO (COMPARATIVA CON SESIÓN ANTERIOR):
   - Si no hay informe previo: “No se proporcionó un informe anterior para el análisis evolutivo.”
   - Si lo hay, analiza:
     - Progresos: Mejoras observadas respecto a los objetivos anteriores.
     - Estancamientos o Retrocesos: Dificultades persistentes o emergentes.
     - Cambios afectivos o conductuales: Observaciones comparativas relevantes.
6. HIPÓTESIS Y LÍNEAS DE TRABAJO ACTUALIZADAS:
   - Establece nuevas hipótesis o refina las existentes.
   - Si corresponde, incluye diagnóstico diferencial justificado, citando códigos DSM-5 y CIE-11.
   - Si no hay base suficiente, escribe: “No se dispone de evidencia clínica suficiente para formular hipótesis diagnósticas.”
7. PLAN DE ACCIÓN Y TAREAS INTER-SESIÓN:
   - Enumera las tareas, ejercicios o recomendaciones acordadas.
   - Si no hay, escribe: “No se han definido tareas específicas para la próxima sesión.”

⚠️ REGLAS CLAVE:
- Nunca inventes contenido.
- Protege la confidencialidad del paciente: usa solo el ID.
- Sigue lenguaje técnico y ético.
- Todo diagnóstico debe basarse en evidencia suficiente y protocolos oficiales.
`;

  const user_prompt = `
    Transcripción de la sesión:
    ---
    ${transcription}
    ---

    Notas adicionales del terapeuta:
    ---
    ${sessionNotes}
    ---
    ${previousReport ? `
    Informe anterior para análisis evolutivo:
    ---
    ${previousReport}
    ---
    ` : ''}
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://inforia.app",
        "X-Title": "iNFORiA SaaS",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: user_prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter for report generation:", error);
    throw new Error("Failed to generate report.");
  }
}


serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method Not Allowed." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', ''));

  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required. Please provide a valid JWT." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audioFile");
    const sessionNotes = formData.get("sessionNotes") as string;
    const previousReport = formData.get("previousReport") as string | undefined;

    if (!audioFile || !sessionNotes) {
      return new Response(JSON.stringify({ error: "Missing required fields: audioFile and sessionNotes must be provided." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!(audioFile instanceof File)) {
      return new Response(JSON.stringify({ error: "Invalid field type: audioFile must be a file." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const transcription = await transcribeAudioWithOpenRouter(audioFile);
    const report = await generateReportWithOpenRouter(transcription, sessionNotes, previousReport);


    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(JSON.stringify({ error: "El servicio de transcripción de IA no está disponible en este momento." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 502,
    });
  }
});
