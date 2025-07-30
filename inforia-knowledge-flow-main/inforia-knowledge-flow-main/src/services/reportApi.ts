// src/services/reportApi.ts

import { supabase } from "@/integrations/supabase";

/**
 * Llama a la Edge Function de Supabase para generar un informe inteligente.
 * @param audioFile - El archivo de audio de la sesión.
 * @param sessionNotes - Las notas del terapeuta sobre la sesión.
 * @param previousReport - El contenido del informe anterior (opcional).
 * @returns La respuesta de la función, que debería contener el informe generado.
 */
export const generateIntelligentReport = async (
  audioFile: File,
  sessionNotes: string,
  previousReport?: string
) => {
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("notes", sessionNotes);
  if (previousReport) {
    formData.append("previous_report", previousReport);
  }

  const { data, error } = await supabase.functions.invoke("generate-report", {
    body: formData,
  });

  if (error) {
    console.error("Error calling Supabase function:", error);
    throw new Error(`Error en la llamada a la API: ${error.message}`);
  }

  return data;
};
