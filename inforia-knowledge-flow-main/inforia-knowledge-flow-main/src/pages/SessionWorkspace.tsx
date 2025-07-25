import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Play, Square, Upload, FileAudio, Volume2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const SessionWorkspace = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setHasFinishedRecording(false);
    setTimer("00:00");
    // TODO: Implement actual recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setFinalDuration(timer);
    setHasFinishedRecording(true);
    // TODO: Implement stop recording logic
  };

  const handleDeleteRecording = () => {
    setHasFinishedRecording(false);
    setTimer("00:00");
    setFinalDuration("");
  };

const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
        // ... (Paso 1: Transcripción con Whisper - sin cambios)
        let transcript = "";
        if (audioFile) {
            const formData = new FormData();
            formData.append('file', audioFile);
            const whisperResponse = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}` },
                body: formData,
            });
            const whisperData = await whisperResponse.json();
            if (whisperData.error) throw new Error(`Error de Whisper: ${whisperData.error.message}`);
            transcript = whisperData.text;
        }

        // ... (Paso 2: Generación con GPT-4o mini - sin cambios)
        const combinedText = `Notas de Sesión:\n${sessionNotes}\n\nTranscripción del Audio:\n${transcript}`;
        const gptResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: "..." }, // Tu prompt de sistema
                    { role: "user", content: combinedText },
                ],
            }),
        });
        const gptData = await gptResponse.json();
        if (gptData.error) throw new Error(`Error de GPT: ${gptData.error.message}`);
        const reportContent = gptData.choices[0].message.content;

        // ... (Paso 3: Guardar en Google Drive - sin cambios)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) throw new Error("Token de acceso de Google no encontrado.");
        gapi.client.setToken({ access_token: session.provider_token });
        const driveResponse = await gapi.client.drive.files.create({
            resource: {
                name: `Informe de Sesión - ${new Date().toISOString().split('T')[0]}`,
                mimeType: 'application/vnd.google-apps.document',
                parents: [patientId || ''],
            },
            media: { mimeType: 'text/plain', body: reportContent },
            fields: 'id, webViewLink',
        });

        // ==================================================================
        // INICIO DE LA NUEVA LÓGICA - Paso 4: Actualizar contador en Supabase
        // ==================================================================
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Usamos RPC para un decremento atómico y seguro en la base de datos
            const { error: decrementError } = await supabase.rpc('decrement_informes_restantes', { user_id_param: user.id });
            if (decrementError) {
                // Si esto falla, solo lo registramos. No bloquea al usuario.
                console.error("Error al actualizar el contador de informes:", decrementError);
            }
        }
        // ==================================================================
        // FIN DE LA NUEVA LÓGICA
        // ==================================================================

        // El toast de éxito se muestra al final, después de todas las operaciones
        toast({
            title: "Informe generado correctamente",
            description: "El informe ha sido guardado y tu contador de uso ha sido actualizado.",
            action: (
                <a href={driveResponse.result.webViewLink} target="_blank" rel="noreferrer">
                    <Button variant="outline">Ver Informe</Button>
                </a>
            ),
        });

    } catch (error: any) {
        console.error("Error al generar el informe:", error);
        toast({
            variant: "destructive",
            title: "Error al generar el informe",
            description: error.message,
        });
    } finally {
        setIsGenerating(false);
    }
};

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header for consistency */}
      <NavigationHeader />

      {/* Main content - centered single column */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header - Context */}
          <div className="text-center">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Registrando Sesión para: Paz García - 22 de julio de 2025
            </h1>
          </div>

          {/* Recording Control Bar */}
          <div className="bg-card border border-module-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Empezar Grabación
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopRecording}
                    variant="destructive"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </Button>
                )}
              </div>

              {/* Status Indicator - Only when recording */}
              {isRecording && (
                <div className="flex items-center space-x-2 text-destructive font-medium">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span>GRABANDO | {timer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Finished Recording Component - Only appears after stopping */}
          {hasFinishedRecording && (
            <Card className="p-6 border border-module-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      Grabación de la sesión.mp3 ({finalDuration})
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Escuchar
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleDeleteRecording}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Session Notes Area */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-foreground">
              Notas de Sesión
            </h2>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe aquí tus notas. El sistema las sincronizará automáticamente con la grabación."
              className="min-h-[400px] text-base resize-none font-sans"
            />
          </div>

          {/* Additional Files Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium text-foreground">
              Adjuntar Archivos Adicionales (Opcional)
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" className="flex-1 sm:flex-none">
                <FileAudio className="mr-2 h-4 w-4" />
                Subir archivo de audio
              </Button>
              <Button variant="secondary" className="flex-1 sm:flex-none">
                <Upload className="mr-2 h-4 w-4" />
                Subir archivo de notas
              </Button>
            </div>
          </div>

          {/* Final Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              variant="secondary"
              size="lg" 
              className="h-12 px-8 text-base font-medium bg-primary text-primary-foreground hover:bg-background hover:text-foreground border hover:border-primary transition-calm"
            >
              Guardar Borrador
            </Button>
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-medium"
              onClick={handleGenerateReport}
            >
              Generar Informe con IA
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionWorkspace;