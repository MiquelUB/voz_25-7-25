import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { gapi } from 'gapi-script';
import { supabase } from "@/integrations/supabase/client";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Folder, MessageSquare, Video } from "lucide-react";

interface PatientData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  motivoConsulta: string;
  folderId: string;
}

const PatientDetailedProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gapi.load('client');
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.provider_token) {
          throw new Error("No se ha encontrado el token de acceso de Google.");
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuario no encontrado.");
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('google_sheet_id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile || !profile.google_sheet_id) {
          throw new Error("No se ha encontrado el Google Sheet del CRM. Por favor, revisa la conexión en 'Mi Cuenta'.");
        }

        const accessToken = session.provider_token;
        gapi.client.setToken({ access_token: accessToken });

        const sheetId = profile.google_sheet_id;
        const response = await gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Hoja 1!A2:I',
        });

        const values = response.result.values || [];
        const patientRow = values.find((row: any[]) => row[8] === patientId);

        if (patientRow) {
          setPatientData({
            nombre: patientRow[0] || '',
            apellidos: patientRow[1] || '',
            email: patientRow[2] || '',
            telefono: patientRow[3] || '',
            fechaNacimiento: patientRow[4] || '',
            genero: patientRow[5] || '',
            direccion: patientRow[6] || '',
            motivoConsulta: patientRow[7] || '',
            folderId: patientRow[8] || '',
          });
        } else {
          throw new Error("No se ha encontrado el paciente.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>No se han encontrado datos para este paciente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg" alt={`${patientData.nombre} ${patientData.apellidos}`} />
              <AvatarFallback className="text-3xl">
                {patientData.nombre[0]}{patientData.apellidos[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-serif font-semibold">
                {patientData.nombre} {patientData.apellidos}
              </h1>
              <p className="text-muted-foreground">{patientData.email}</p>
            </div>
          </div>
          <Button className="mt-4 md:mt-0">Crear Nuevo Informe</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p>{patientData.telefono}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                  <p>{patientData.fechaNacimiento}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Género</p>
                  <p>{patientData.genero}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p>{patientData.direccion}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Motivo de la Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{patientData.motivoConsulta}</p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="sesiones">
              <TabsList>
                <TabsTrigger value="sesiones">Historial de Sesiones</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>
              <TabsContent value="sesiones" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sesiones Recientes</CardTitle>
                    <CardDescription>Aquí se mostrará un listado de las sesiones grabadas y analizadas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Placeholder for session history */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Sesión del 2024-07-20</p>
                          <p className="text-sm text-muted-foreground">Duración: 45 min</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Ver Análisis</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="documentos" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Archivos del Paciente</CardTitle>
                    <CardDescription>Documentos, informes y otros archivos almacenados en Google Drive.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Placeholder for file list from Google Drive */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <p className="font-medium">Informe_Psicológico_Inicial.pdf</p>
                      </div>
                      <Button variant="outline" size="sm">Descargar</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailedProfile;
