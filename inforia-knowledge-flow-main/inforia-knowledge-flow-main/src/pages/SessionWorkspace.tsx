import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Play, Square, Upload, FileAudio, Volume2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Status = "idle" | "recording" | "processing" | "success" | "error";

const SessionWorkspace = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [finalDuration, setFinalDuration] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setStatus("recording");

      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);

    } catch (err) {
      toast({
        title: "Error de Permiso",
        description: "No se pudo acceder al micrófono. Por favor, comprueba los permisos en tu navegador.",
        variant: "destructive",
      });
      console.error("Error accessing microphone:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setFinalDuration(timer);
      setStatus("idle");
    }
  };

  const handleDeleteRecording = () => {
    setAudioBlob(null);
    setTimer("00:00");
    setFinalDuration("");
  };

  const handleGenerateReport = async () => {
    if (!audioBlob) {
      toast({ title: "Error", description: "No hay ninguna grabación para procesar.", variant: "destructive" });
      return;
    }

    setStatus("processing");
    toast({ title: "Procesando...", description: "Generando informe con IA. Esto puede tardar unos segundos." });

    try {
      const formData = new FormData();
      formData.append("audioFile", audioBlob, "session_recording.webm");
      formData.append("sessionNotes", notes);
      // formData.append("previousReport", previousReport); // Add this if you have a previous report

      const { data, error } = await supabase.functions.invoke('informe-inteligente', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Informe generado:", data.report);
      setStatus("success");
      toast({ title: "Éxito", description: "El informe ha sido generado y guardado." });

    } catch (err) {
      setStatus("error");
      const errorMessage = (err as Error).message || "Ocurrió un error desconocido.";
      toast({
        title: "Error al generar informe",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error invoking edge function:", err);
    }
  };

  const isRecording = status === "recording";
  const isProcessing = status === "processing";
  const hasFinishedRecording = audioBlob !== null;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Registrando Sesión para: Paz García - 22 de julio de 2025
            </h1>
          </div>

          <div className="bg-card border border-module-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <Button onClick={handleStartRecording} disabled={isProcessing}>
                    <Play className="mr-2 h-4 w-4" />
                    Empezar Grabación
                  </Button>
                ) : (
                  <Button onClick={handleStopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center space-x-2 text-destructive font-medium">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span>GRABANDO | {timer}</span>
                </div>
              )}
            </div>
          </div>

          {hasFinishedRecording && (
            <Card className="p-6 border border-module-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      Grabación de la sesión ({finalDuration})
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => {
                    if (audioBlob) {
                      const audioUrl = URL.createObjectURL(audioBlob);
                      const audio = new Audio(audioUrl);
                      audio.play();
                    }
                  }}>
                    <Play className="mr-2 h-4 w-4" />
                    Escuchar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleDeleteRecording}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-foreground">
              Notas de Sesión
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe aquí tus notas..."
              className="min-h-[400px] text-base resize-none font-sans"
              disabled={isProcessing}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 px-8 text-base font-medium"
              disabled={isProcessing}
            >
              Guardar Borrador
            </Button>
            <Button
              size="lg"
              className="h-12 px-8 text-base font-medium"
              onClick={handleGenerateReport}
              disabled={!hasFinishedRecording || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar Informe con IA"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionWorkspace;