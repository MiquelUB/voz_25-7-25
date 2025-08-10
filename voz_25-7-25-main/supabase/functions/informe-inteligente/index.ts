// supabase/functions/informe-inteligente/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// PRINCIPIO #2: Externalizamos el prompt para poder modificarlo sin redesplegar.
import SYSTEM_PROMPT from '../_shared/system_prompt.md';

// --- Constantes de Configuración ---
// Facilita la actualización de modelos en el futuro.
const OPENROUTER_API_URL_TRANSCRIPTIONS = "https://openrouter.ai/api/v1/audio/transcriptions";
const OPENROUTER_API_URL_COMPLETIONS = "https://openrouter.ai/api/v1/chat/completions";
const TRANSCRIPTION_MODEL = "openai/whisper-1";
const REPORT_GENERATION_MODEL = "claude-3-haiku";
const HTTP_REFERER = "https://inforia.app"; // O el dominio de desarrollo/producción
const X_TITLE = "iNFORiA SaaS";

/**
 * Transcribe un archivo de audio utilizando la API de OpenRouter.
 * @param audioFile - El archivo de audio a transcribir.
 * @returns La transcripción en formato de texto.
 */
async function transcribeAudio(audioFile: File): Promise<string> {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set in environment variables.");
    throw new Error("Configuration error: OpenRouter API key is missing.");
  }

  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", TRANSCRIPTION_MODEL);

  try {
    const response = await fetch(OPENROUTER_API_URL_TRANSCRIPTIONS, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": HTTP_REFERER,
        "X-Title": X_TITLE,
      },
      body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenRouter transcription API responded with status: ${response.status}`, errorBody);
        throw new Error(`AI service failed during transcription. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
        console.error("OpenRouter transcription response did not contain text.", data);
        throw new Error("Invalid response from transcription service.");
    }
    return data.text;
  } catch (error) {
    console.error("Error calling OpenRouter for transcription:", error.message);
    // Relanzamos el error para que el manejador principal lo capture.
    throw error;
  }
}

/**
 * Genera un informe clínico utilizando la API de OpenRouter.
 * @param transcription - La transcripción de la sesión.
 * @param sessionNotes - Las notas del terapeuta.
 * @param previousReport - (Opcional) El informe de la sesión anterior.
 * @returns El informe clínico generado en formato Markdown.
 */
async function generateReport(transcription: string, sessionNotes: string, previousReport?: string): Promise<string> {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY is not set in environment variables.");
        throw new Error("Configuration error: OpenRouter API key is missing.");
    }

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
    const response = await fetch(OPENROUTER_API_URL_COMPLETIONS, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": HTTP_REFERER,
        "X-Title": X_TITLE,
      },
      body: JSON.stringify({
        model: REPORT_GENERATION_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: user_prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter completions API responded with status: ${response.status}`, errorBody);
      throw new Error(`AI service failed during report generation. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error("OpenRouter completions response was invalid.", data);
        throw new Error("Invalid response from report generation service.");
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter for report generation:", error.message);
    throw error;
  }
}


serve(async (req) => {
  // Manejo de la petición preflight para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. --- Validación de Método y Autenticación ---
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

    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
        return new Response(JSON.stringify({ error: "Authentication token is missing." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401,
        });
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser(authToken);

    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication failed. Invalid JWT." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // 2. --- Validación del FormData ---
    const formData = await req.formData();
    const audioFile = formData.get("audioFile");
    const sessionNotes = formData.get("sessionNotes");
    const previousReport = formData.get("previousReport"); // Puede ser null

    // Validamos que los campos requeridos no solo existan, sino que sean del tipo correcto.
    if (!(audioFile instanceof File)) {
        return new Response(JSON.stringify({ error: "Invalid or missing field: 'audioFile' must be a file." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    if (typeof sessionNotes !== 'string' || sessionNotes.trim() === '') {
        return new Response(JSON.stringify({ error: "Invalid or missing field: 'sessionNotes' must be a non-empty string." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    // \`previousReport\` es opcional, pero si existe, debe ser un string.
    if (previousReport !== null && typeof previousReport !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid field type: 'previousReport' must be a string if provided." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }

    // 3. --- Verificación de Cuota ---
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('informes_restantes')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new Response(JSON.stringify({ error: "Could not retrieve user profile." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (profile.informes_restantes <= 0) {
      return new Response(JSON.stringify({ error: "No te quedan informes disponibles." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403, // Forbidden
      });
    }

    // 4. --- Ejecución del Flujo Principal ---
    const transcription = await transcribeAudio(audioFile);
    const report = await generateReport(transcription, sessionNotes, previousReport || undefined);

    // 5. --- Decrementar Cuota ---
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ informes_restantes: profile.informes_restantes - 1 })
      .eq('id', user.id);

    if (updateError) {
      // Si esto falla, es importante registrarlo, pero el informe ya se generó.
      // Podríamos tener un sistema de reintentos o alertas para el equipo de desarrollo.
      console.error("CRITICAL: Failed to decrement report count for user:", user.id, updateError);
    }

    // 6. --- Respuesta Exitosa ---
    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // 5. --- Manejador de Errores Global ---
    console.error("Unhandled error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      // Usamos 502 (Bad Gateway) si el error viene de un servicio externo como OpenRouter
      // o 500 si es un error interno.
      status: error.message.includes("AI service failed") ? 502 : 500,
    });
  }
});
