// src/pages/SessionWorkspace.tsx

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square, Mic, Trash2, Headphones, FileAudio, FileText, Loader2, Save, FileClock } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { saveReportToDrive, listReportsFromDrive, readReportFromDrive } from "../../lib/gdrive";


export default function SessionWorkspace() {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // State for previous reports
  const [previousReports, setPreviousReports] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReportContent, setSelectedReportContent] = useState<string | null>(null);

  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('draftNotes');
      const savedAudio = localStorage.getItem('draftAudio');
      let draftLoaded = false;

      if (savedNotes !== null) {
        setNotes(savedNotes);
        draftLoaded = true;
      }

      if (savedAudio) {
        fetch(savedAudio)
          .then(res => res.blob())
          .then(blob => {
            setAudioBlob(blob);
            setHasFinishedRecording(true);
            const audio = new Audio();
            audio.src = URL.createObjectURL(blob);
            audio.onloadedmetadata = () => {
              const minutes = Math.floor(audio.duration / 60);
              const seconds = Math.floor(audio.duration % 60);
              const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
              setFinalDuration(formattedTime);
              setTimer(formattedTime);
            };
          });
        draftLoaded = true;
      }

      if (draftLoaded) {
        toast({ title: "Borrador Cargado", description: "Se ha restaurado tu sesión anterior." });
      }
    } catch (error) {
      console.error("Error loading draft from localStorage:", error);
    }
  }, [toast]);

  // Fetch previous reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoadingReports(true);
      try {
        const reports = await listReportsFromDrive();
        setPreviousReports(reports);
      } catch (error) {
        console.error("Error fetching previous reports:", error);
        toast({
          title: "Error al Cargar Informes",
          description: "No se pudieron cargar los informes anteriores desde Google Drive.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [toast]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setHasFinishedRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setHasFinishedRecording(false);
      setAudioBlob(null);
      recordingStartTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTimeRef.current;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setTimer(formattedTime);
        setFinalDuration(formattedTime);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      // Here you might want to show a toast to the user
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handlePlayAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleDeleteAudio = () => {
    setAudioBlob(null);
    setHasFinishedRecording(false);
    setTimer("00:00");
    setFinalDuration("");
  };

  const handleReportSelected = async (reportId: string) => {
    if (!reportId) {
      setSelectedReportContent(null);
      return;
    }

    try {
      const content = await readReportFromDrive(reportId);
      setSelectedReportContent(content);
      toast({
        title: "Informe Cargado",
        description: "El informe anterior ha sido cargado para análisis evolutivo.",
      });
    } catch (error) {
      console.error("Error reading selected report:", error);
      toast({
        title: "Error al Cargar Informe",
        description: "No se pudo leer el contenido del informe seleccionado.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setGeneratedReport(null);
    setSavedReportId(null); // Reset save state when generating a new report

    if (!audioBlob) {
      toast({
        title: "Error: No hay audio",
        description: "Por favor, graba una sesión antes de generar un informe.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!notes.trim()) {
      toast({
        title: "Error: No hay notas",
        description: "Por favor, escribe algunas notas sobre la sesión.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error de autenticación",
          description: "No se pudo verificar tu sesión. Por favor, inicia sesión de nuevo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("audioFile", audioBlob, "session_audio.webm");
      formData.append("sessionNotes", notes);
      formData.append("previousReport", selectedReportContent || "");

      const { data, error } = await supabase.functions.invoke("informe-inteligente", {
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (error) {
        throw error;
      }

      if (data.report) {
        setGeneratedReport(data.report);
        toast({
          title: "Informe Generado",
          description: "El informe de IA se ha creado exitosamente.",
        });
      } else {
         throw new Error("La respuesta de la función no contenía un informe.");
      }

    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error al generar el informe",
        description: error.message || "Ocurrió un error inesperado. Revisa la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!generatedReport) {
      toast({
        title: "Error",
        description: "No hay informe generado para guardar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `iNFORiA-Report-${timestamp}.txt`;

      const fileId = await saveReportToDrive(fileName, generatedReport);

      if (fileId) {
        setSavedReportId(fileId);
        // Refresh the list of reports after saving a new one
        const updatedReports = await listReportsFromDrive();
        setPreviousReports(updatedReports);
        toast({
          title: "Informe Guardado",
          description: `El informe ha sido guardado en tu Google Drive con el nombre: ${fileName}`,
        });
      } else {
        throw new Error("No se pudo obtener el ID del archivo guardado.");
      }
    } catch (error) {
      console.error("Error saving report to Google Drive:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar el informe en Google Drive. Revisa los permisos y la consola.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAttachAudioClick = () => {
    audioInputRef.current?.click();
  };

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setHasFinishedRecording(true);

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setFinalDuration(formattedTime);
        setTimer(formattedTime);
      };
    }
  };

  const handleAttachNotesClick = () => {
    notesInputRef.current?.click();
  };

  const handleNotesFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setNotes(text);
      };
      reader.readAsText(file);
    }
  };

  const toBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveDraft = async () => {
    if (!notes.trim() && !audioBlob) {
      toast({
        title: "Nada que guardar",
        description: "Escribe notas o graba/adjunta audio para guardar un borrador.",
      });
      return;
    }

    setIsSavingDraft(true);
    try {
      localStorage.setItem('draftNotes', notes);
      if (audioBlob) {
        const base64Audio = await toBase64(audioBlob);
        localStorage.setItem('draftAudio', base64Audio);
      } else {
        localStorage.removeItem('draftAudio');
      }
      toast({ title: "Borrador Guardado", description: "Tu progreso se ha guardado localmente." });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error al Guardar Borrador",
        description: "No se pudo guardar el borrador en el navegador.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <DashboardHeader />

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold">Registro de Sesión</h1>
        <p className="text-lg text-gray-600">Graba, toma notas y genera informes de manera integrada.</p>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mic className="h-6 w-6 text-gray-700" />
              <span className="font-sans text-xl">Control de Grabación</span>
            </div>
            <div className={`flex items-center space-x-2 ${isRecording ? 'text-red-600' : 'text-gray-500'}`}>
              {isRecording && <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>}
              <span className="font-mono text-2xl">{timer}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-6">
          {!isRecording ? (
            <Button size="lg" style={{ backgroundColor: '#2E403B', color: 'white' }} onClick={handleStartRecording} disabled={hasFinishedRecording && !isRecording}>
              <Play className="mr-2 h-5 w-5" />
              Empezar Grabación
            </Button>
          ) : (
            <Button size="lg" variant="destructive" style={{ backgroundColor: '#800020' }} onClick={handleStopRecording}>
              <Square className="mr-2 h-5 w-5" />
              Parar Grabación
            </Button>
          )}

          {hasFinishedRecording && (
            <Card className="w-full bg-gray-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Grabación finalizada</p>
                  <p className="text-sm text-gray-500">Duración: {finalDuration}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handlePlayAudio}>
                    <Headphones className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDeleteAudio}>
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="font-sans text-xl">
            Área de Notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tus notas se guardan automáticamente a medida que escribes..."
            className="min-h-[400px] resize-none font-sans"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="font-sans text-xl">
            Archivos Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={audioInputRef}
            onChange={handleAudioFileChange}
            accept="audio/*"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={notesInputRef}
            onChange={handleNotesFileChange}
            accept=".txt,.md"
            style={{ display: 'none' }}
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={handleAttachAudioClick}>
              <FileAudio className="mr-2 h-5 w-5" />
              Adjuntar Audio
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={handleAttachNotesClick}>
              <FileText className="mr-2 h-5 w-5" />
              Adjuntar Notas
            </Button>
          </div>
        </CardContent>
      </Card>

  <Card className="bg-white shadow-lg">
    <CardHeader>
      <CardTitle className="font-sans text-xl flex items-center space-x-3">
        <FileClock className="h-6 w-6 text-gray-700" />
        <span>Análisis Evolutivo (Opcional)</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
       <Select onValueChange={handleReportSelected} disabled={isLoadingReports || previousReports.length === 0}>
        <SelectTrigger>
          <SelectValue placeholder={isLoadingReports ? "Cargando informes..." : "Seleccionar informe anterior"} />
        </SelectTrigger>
        <SelectContent>
          {previousReports.map(report => (
            <SelectItem key={report.id} value={report.id}>
              {report.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500 mt-2">
        Selecciona un informe de una sesión previa para que la IA lo utilice como contexto y realice un análisis evolutivo.
      </p>
    </CardContent>
  </Card>

  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button variant="secondary" size="lg" onClick={handleSaveDraft} disabled={isSavingDraft}>
        {isSavingDraft ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Borrador"
        )}
      </Button>
      <Button size="lg" style={{ backgroundColor: '#2E403B', color: 'white' }} onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar Informe con IA"
            )}
          </Button>
      </div>

      {generatedReport && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="font-sans text-xl flex justify-between items-center">
              <span>Informe Generado por IA</span>
              <Button
                onClick={handleSaveReport}
                disabled={isSaving || !!savedReportId}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {savedReportId ? "Guardado" : (isSaving ? "Guardando..." : "Guardar en Drive")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-sans">
              {generatedReport}
            </pre>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  );
}
