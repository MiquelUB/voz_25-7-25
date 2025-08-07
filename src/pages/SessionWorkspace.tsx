// src/pages/SessionWorkspace.tsx

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Mic, Trash2, Headphones, FileAudio, FileText } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function SessionWorkspace() {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

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

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" className="w-full sm:w-auto">
              <FileAudio className="mr-2 h-5 w-5" />
              Adjuntar Audio
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto">
              <FileText className="mr-2 h-5 w-5" />
              Adjuntar Notas
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="secondary" size="lg">Guardar Borrador</Button>
          <Button size="lg" style={{ backgroundColor: '#2E403B', color: 'white' }}>Generar Informe con IA</Button>
      </div>

    </div>
  );
}
