"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const patientFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
  generalNotes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientDetailedProfileFormProps {
    patient: Patient;
    onSubmit: (data: PatientFormValues) => void;
    isSubmitting: boolean;
}

export default function PatientDetailedProfileForm({ patient, onSubmit, isSubmitting }: PatientDetailedProfileFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient,
  });

  useEffect(() => {
    form.reset(patient);
  }, [patient, form]);

  return (
    <Form {...form}>
      <form data-testid="patient-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl><Input {...field} /></FormControl>
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
              <FormControl><Input type="email" {...field} /></FormControl>
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
              <FormControl><Input {...field} /></FormControl>
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
              <FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando Cambios..." : "Guardar Cambios"}
        </Button>
      </form>
    </Form>
  );
}
