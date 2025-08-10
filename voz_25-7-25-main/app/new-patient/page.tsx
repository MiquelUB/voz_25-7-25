"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoogleDriveService } from "@/src/services/google.service";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DashboardHeader from "@/components/DashboardHeader";
import { v4 as uuidv4 } from 'uuid';


const patientFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
  generalNotes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export default function NewPatientPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      generalNotes: "",
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    if (!session?.accessToken) {
        toast({ title: "Error de autenticación", variant: "destructive" });
        return;
    }

    const driveService = new GoogleDriveService(session.accessToken);

    try {
        const fileContent = await driveService.readFile("patients.json");
        const patients = fileContent ? JSON.parse(fileContent) : [];

        const newPatient: Patient = {
            id: uuidv4(),
            ...data,
        };

        const updatedPatients = [...patients, newPatient];
        await driveService.saveFile("patients.json", JSON.stringify(updatedPatients, null, 2));

        toast({
            title: "Paciente Creado",
            description: "El nuevo paciente ha sido guardado correctamente.",
        });

        router.push("/patient-list");

    } catch (error) {
        console.error("Error creating patient:", error);
        toast({
            title: "Error al crear el paciente",
            description: "No se pudo guardar el paciente. Inténtalo de nuevo.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
        <DashboardHeader />
        <Card className="bg-white shadow-lg">
            <CardHeader>
                <CardTitle>Crear Ficha de Paciente</CardTitle>
                <CardDescription>Añade un nuevo paciente a tu lista.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del paciente" {...field} />
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
                                        <Input type="email" placeholder="email@ejemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 456 789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="generalNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Generales</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Anotaciones importantes sobre el paciente..." className="min-h-[150px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Paciente"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Toaster />
    </div>
  );
}
