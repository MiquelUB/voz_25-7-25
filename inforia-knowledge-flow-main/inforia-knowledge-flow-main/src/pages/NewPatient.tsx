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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  const [userProfile, setUserProfile] = useState<any>(null);

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
    gapi.load('client');

    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('google_sheet_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else {
          setUserProfile(profile);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSavePatient = async (data: PatientFormValues, createReport = false) => {
    setIsSubmitting(true);

    if (!userProfile || !userProfile.google_sheet_id) {
      toast({ variant: "destructive", title: "Error de configuración", description: "No se ha encontrado el Google Sheet del CRM. Por favor, revisa la conexión en 'Mi Cuenta'." });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.provider_token) {
        throw new Error("Token de acceso de Google no encontrado.");
      }

      const accessToken = session.provider_token;
      gapi.client.setToken({ access_token: accessToken });

      const folderName = `${data.nombre} ${data.apellidos} - ${uuidv4()}`;
      const driveResponse = await gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      const folderId = driveResponse.result.id;

      const sheetId = userProfile.google_sheet_id;
      await gapi.client.sheets.spreadsheets.values.append({
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

      toast({ title: "Paciente creado correctamente" });

      if (createReport) {
        // navigate(`/new-report?patient=${folderId}`);
      }

    } catch (error) {
      console.error("Error al crear la ficha del paciente:", error);
      toast({ variant: "destructive", title: "Error al crear la ficha" });
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => handleSavePatient(data, false))}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaNacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        <SelectItem value="no-especificado">Prefiero no especificar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="motivoConsulta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo de la Consulta</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
        </Form>
      </div>
    </div>
  );
};

export default NewPatient;