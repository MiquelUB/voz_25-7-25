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
async function generateReportWithOpenRouter(transcription: string, sessionNotes: string): Promise<string> {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const system_prompt = `
    Eres un asistente experto en la redacción de informes psiquiátricos.
    Tu tarea es recibir la transcripción de una sesión de terapia y las notas del terapeuta,
    y estructurar esa información en un informe profesional, coherente y bien redactado.
    El informe debe seguir estrictamente el siguiente formato con títulos en negrita:

    **Análisis de la Sesión**
    [Resume y analiza los puntos clave de la conversación, el estado de ánimo del paciente, y los temas principales tratados.]

    **Observaciones**
    [Detalla las observaciones del terapeuta sobre el lenguaje no verbal, el comportamiento y el progreso del paciente.]

    **Posibles Hipótesis Diagnósticas**
    [Basado en la información, sugiere posibles hipótesis diagnósticas a considerar. Usa un lenguaje cauto y profesional.]

    **Plan de Tratamiento Sugerido**
    [Propón los siguientes pasos para el tratamiento, incluyendo técnicas a utilizar, tareas para el paciente o áreas a explorar en futuras sesiones.]
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
          { role: "system", content: system_prompt },
          { role: "user", content: user_prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
    const report = await generateReportWithOpenRouter(transcription, sessionNotes);


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
