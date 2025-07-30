import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { gapi } from "gapi-script";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Play, Square, Upload, FileAudio, Volume2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateIntelligentReport } from "@/services/reportApi";

const SessionWorkspace = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "grabacion-sesion.webm", { type: "audio/webm" });
        setAudioFile(file);
        audioChunks.current = [];
      };

      recorder.start();
      setIsRecording(true);
      setHasFinishedRecording(false);
      setTimer("00:00");

    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error de micrófono",
        description: "No se pudo acceder al micrófono. Asegúrate de dar permiso en tu navegador.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setFinalDuration(timer);
    setHasFinishedRecording(true);
  };

  const handleDeleteRecording = () => {
    setHasFinishedRecording(false);
    setTimer("00:00");
    setFinalDuration("");
    setAudioFile(null);
  };

  const handleGenerateReport = async () => {
    if (!audioFile) {
      toast({
        title: "Falta el archivo de audio",
        description: "Por favor, graba o sube un archivo de audio para la sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: "Generando informe inteligente...",
      description: "Este proceso puede tardar unos minutos. Te avisaremos cuando esté listo.",
    });

    try {
      const result = await generateIntelligentReport(audioFile, notes);

      // TODO: Manejar el resultado. Por ejemplo, mostrar el informe en un modal o redirigir.
      console.log("Informe generado:", result);

      toast({
        title: "Informe generado con éxito",
        description: "El informe inteligente se ha creado y guardado.",
      });

    } catch (error) {
      console.error("Error al generar el informe:", error);
      toast({
        title: "Error al generar el informe",
        description: (error as Error).message,
        variant: "destructive",
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
              disabled={isGenerating}
            >
              {isGenerating ? "Generando..." : "Generar Informe con IA"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionWorkspace;