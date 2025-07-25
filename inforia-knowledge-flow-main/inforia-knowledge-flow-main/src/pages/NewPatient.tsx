import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';
import { gapi } from 'gapi-script';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { supabase } from "@/integrations/supabase/client";

const patientFormSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  genero: z.string().optional(),
  direccion: z.string().optional(),
  motivoConsulta: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const NewPatient = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      fechaNacimiento: "",
      genero: "",
      direccion: "",
      motivoConsulta: "",
    },
  });

  useEffect(() => {
    const start = () => {
      gapi.client.init({
        apiKey: 'YOUR_API_KEY', // Replace with your Google API Key
        clientId: 'YOUR_CLIENT_ID', // Replace with your Google Client ID
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://sheets.googleapis.com/$discovery/rest?version=v4',
        ],
      });
    };
    gapi.load('client:auth2', start);
  }, []);

  const handleSavePatient = async (data: PatientFormValues, createReport = false) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.provider_token) {
        throw new Error("No se ha encontrado el token de acceso de Google.");
      }

      const accessToken = session.provider_token;
      gapi.auth.setToken({ access_token: accessToken });

      // 1. Create Google Drive Folder
      const folderName = `${data.nombre} ${data.apellidos} - ${uuidv4()}`;
      const driveResponse = await gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      const folderId = driveResponse.result.id;

      // 2. Add row to Google Sheet
      const sheetId = 'YOUR_SHEET_ID'; // Replace with your Google Sheet ID
      const sheetResponse = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [
            [
              data.nombre,
              data.apellidos,
              data.email,
              data.telefono,
              data.fechaNacimiento,
              data.genero,
              data.direccion,
              data.motivoConsulta,
              folderId,
            ],
          ],
        },
      });

      toast({
        title: "Paciente creado correctamente",
        description: "La ficha del paciente ha sido guardada en Google Drive y Google Sheets.",
      });

      if (createReport) {
        // Redirect to create report page with patient data
        // navigate(`/new-report?patient=${folderId}`);
      }
    } catch (error) {
      console.error("Error al crear la ficha del paciente:", error);
      toast({
        variant: "destructive",
        title: "Error al crear la ficha del paciente",
        description: "Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">
          Crear Nueva Ficha de Paciente
        </h1>
        <p className="text-muted-foreground mb-8">
          Completa los siguientes campos para crear un nuevo perfil de paciente.
        </p>

        <form
          onSubmit={form.handleSubmit((data) => handleSavePatient(data, false))}
          className="space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...form.register("nombre")} />
              {form.formState.errors.nombre && (
                <p className="text-sm text-red-500">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" {...form.register("apellidos")} />
              {form.formState.errors.apellidos && (
                <p className="text-sm text-red-500">{form.formState.errors.apellidos.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...form.register("telefono")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input type="date" id="fechaNacimiento" {...form.register("fechaNacimiento")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genero">Género</Label>
              <Select onValueChange={(value) => form.setValue("genero", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                  <SelectItem value="no-especificado">Prefiero no especificar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...form.register("direccion")} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="motivoConsulta">Motivo de la Consulta</Label>
              <Textarea
                id="motivoConsulta"
                {...form.register("motivoConsulta")}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Ficha"}
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={isSubmitting}
              onClick={form.handleSubmit((data) => handleSavePatient(data, true))}
            >
              {isSubmitting ? "Guardando..." : "Guardar y Crear Informe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatient;