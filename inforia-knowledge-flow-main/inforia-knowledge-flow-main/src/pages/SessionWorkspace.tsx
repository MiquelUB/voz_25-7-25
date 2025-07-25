import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { gapi } from 'gapi-script';
import { supabase } from "@/integrations/supabase/client";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Bot } from "lucide-react";

const SessionWorkspace = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { toast } = useToast();

    const [sessionNotes, setSessionNotes] = useState("");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Cargar el cliente de GAPI una sola vez al montar el componente
    useEffect(() => {
        gapi.load('client');
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setAudioFile(event.target.files[0]);
        }
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            // 1. Transcribir el audio si existe
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

            // 2. Generar el informe con GPT-4o mini
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
                        { role: "system", content: "Eres un asistente de psicología. Tu tarea es generar un informe clínico estructurado a partir de las notas de sesión y la transcripción de un audio. El informe debe ser claro, conciso y profesional." },
                        { role: "user", content: combinedText },
                    ],
                }),
            });
            const gptData = await gptResponse.json();
            if (gptData.error) throw new Error(`Error de GPT: ${gptData.error.message}`);
            const reportContent = gptData.choices[0].message.content;

            // 3. Guardar el informe en Google Drive
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.provider_token) throw new Error("Token de acceso de Google no encontrado.");

            gapi.client.setToken({ access_token: session.provider_token });

            const driveResponse = await gapi.client.drive.files.create({
                resource: {
                    name: `Informe de Sesión - ${new Date().toISOString().split('T')[0]}`,
                    mimeType: 'application/vnd.google-apps.document',
                    parents: [patientId || ''], // Usamos el patientId de la URL como folderId
                },
                media: {
                    mimeType: 'text/plain',
                    body: reportContent,
                },
                fields: 'id, webViewLink',
            });

            toast({
                title: "Informe generado correctamente",
                description: "El informe ha sido guardado en la carpeta del paciente.",
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
            <NavigationHeader />
            <div className="container mx-auto px-6 py-8">
                <h1 className="font-serif text-3xl font-medium text-foreground mb-8">
                    Espacio de Trabajo de la Sesión
                </h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notas de la Sesión</CardTitle>
                            <CardDescription>Escribe aquí tus observaciones, análisis y notas clave de la sesión.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={sessionNotes}
                                onChange={(e) => setSessionNotes(e.target.value)}
                                rows={15}
                                placeholder="Inicio de la sesión..."
                            />
                        </CardContent>
                    </Card>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grabación de Audio</CardTitle>
                                <CardDescription>Sube el archivo de audio de la sesión para transcribirlo y analizarlo.</CardDescription>
                            </Header>
                            <CardContent>
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                        </p>
                                        <p className="text-xs text-muted-foreground">MP3, WAV, M4A (MAX. 25MB)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
                                </label>
                                {audioFile && (
                                    <p className="mt-4 text-sm text-center text-muted-foreground">
                                        Archivo seleccionado: {audioFile.name}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isGenerating || (!sessionNotes && !audioFile)}
                            className="w-full"
                            size="lg"
                        >
                            <Bot className="mr-2 h-5 w-5" />
                            {isGenerating ? "Generando informe..." : "Generar Informe con IA"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionWorkspace;
