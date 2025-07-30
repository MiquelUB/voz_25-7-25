// supabase/functions/informe-inteligente/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// ¡CAMBIO CLAVE! Importamos el prompt desde el archivo externo.
import SYSTEM_PROMPT from '../_shared/system_prompt.md';

// --- Constantes de Configuración ---
const OPENROUTER_API_URL_TRANSCRIPTIONS = "https://openrouter.ai/api/v1/audio/transcriptions";
const OPENROUTER_API_URL_COMPLETIONS = "https://openrouter.ai/api/v1/chat/completions";
const TRANSCRIPTION_MODEL = "openai/whisper-1";
const REPORT_GENERATION_MODEL = "openai/gpt-4o-mini";
const HTTP_REFERER = "https://inforia.app";
const X_TITLE = "iNFORiA SaaS";

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
    throw error;
  }
}

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
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
    const formData = await req.formData();
    const audioFile = formData.get("audioFile");
    const sessionNotes = formData.get("sessionNotes");
    const previousReport = formData.get("previousReport");
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
    if (previousReport !== null && typeof previousReport !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid field type: 'previousReport' must be a string if provided." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    const transcription = await transcribeAudio(audioFile);
    const report = await generateReport(transcription, sessionNotes, previousReport || undefined);
    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Unhandled error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message.includes("AI service failed") ? 502 : 500,
    });
  }
});
