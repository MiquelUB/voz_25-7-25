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
    console.error("Error calling OpenRouter:", error);
    throw new Error("Failed to transcribe audio.");
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
    const sessionNotes = formData.get("sessionNotes");

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

    return new Response(JSON.stringify({ transcription, sessionNotes }), {
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
