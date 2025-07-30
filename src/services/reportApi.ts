// src/services/reportApi.ts

import { supabase } from '../integrations/supabase/client';

/**
 * Llama a la Edge Function 'informe-inteligente' para generar un nuevo informe.
 * Esta función centraliza la lógica de la API, el manejo de la autenticación y los errores.
 *
 * @param audioFile El archivo de audio de la sesión.
 * @param sessionNotes Las notas de texto del terapeuta.
 * @param previousReport El contenido del informe anterior (opcional).
 * @returns El objeto de respuesta de la función, que contiene el informe generado.
 * @throws Lanza un error si el usuario no está autenticado o si la llamada a la API falla.
 */
export async function generateIntelligentReport(
  audioFile: File,
  sessionNotes: string,
  previousReport?: string
) {
  // 1. Asegurarse de que el usuario tiene una sesión activa.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado. Por favor, inicie sesión de nuevo.");
  }

  // 2. Construir el FormData para enviar a la función.
  const formData = new FormData();
  formData.append("audioFile", audioFile);
  formData.append("sessionNotes", sessionNotes);
  if (previousReport) {
    formData.append("previousReport", previousReport);
  }

  // 3. Invocar la Edge Function de Supabase.
  const { data, error } = await supabase.functions.invoke('informe-inteligente', {
    body: formData,
  });

  // 4. Manejar posibles errores de la llamada.
  if (error) {
    throw new Error(`Error al generar el informe: ${error.message}`);
  }

  // 5. Devolver los datos si la llamada fue exitosa.
  return data;
}
