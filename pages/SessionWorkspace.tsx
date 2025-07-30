// pages/SessionWorkspace.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { generateIntelligentReport } from '@/services/reportApi';


export default function SessionWorkspace() {
  const { toast } = useToast();

  // --- Estados para los datos del formulario ---
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [previousReport, setPreviousReport] = useState("");

  // --- Estados para controlar la UI durante la llamada a la API ---
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAudioFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!audioFile || !sessionNotes.trim()) {
      toast({
        title: "Faltan datos",
        description: "Por favor, sube un archivo de audio y añade tus notas de la sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedReport("");

    try {
      const result = await generateIntelligentReport(
        audioFile,
        sessionNotes,
        previousReport
      );

      if (result && result.report) {
          setGeneratedReport(result.report);
          toast({
            title: "Informe generado con éxito",
            description: "El informe inteligente está listo para tu revisión.",
          });
      } else {
          throw new Error("La respuesta del servidor no tuvo el formato esperado.");
      }

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      toast({
        title: "Error al generar el informe",
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Espacio de Trabajo de la Sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna de Entradas */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="audio-file" className="text-lg font-semibold">1. Archivo de Audio de la Sesión</Label>
              <Input id="audio-file" type="file" accept="audio/*" onChange={handleFileChange} disabled={isLoading} required />
            </div>
            <div>
              <Label htmlFor="session-notes" className="text-lg font-semibold">2. Notas Adicionales del Terapeuta</Label>
              <Textarea
                id="session-notes"
                placeholder="Añade aquí tus notas, observaciones o cualquier dato relevante de la sesión..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={10}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="previous-report" className="text-lg font-semibold">3. Informe Anterior (Opcional)</Label>
              <Textarea
                id="previous-report"
                placeholder="Pega aquí el contenido del informe anterior para un análisis evolutivo..."
                value={previousReport}
                onChange={(e) => setPreviousReport(e.target.value)}
                rows={10}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Columna de Resultados */}
          <div className="space-y-6">
            <div>
                <Label className="text-lg font-semibold">4. Informe Inteligente Generado</Label>
                <div className="prose border rounded-md p-4 bg-gray-50 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            <p className="ml-2">Generando informe...</p>
                        </div>
                    ) : (
                        <p style={{ whiteSpace: 'pre-wrap' }}>{generatedReport || "El informe aparecerá aquí una vez generado."}</p>
                    )}
                </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar Informe Inteligente"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
