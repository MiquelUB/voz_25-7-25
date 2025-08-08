"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleDriveService } from "@/src/services/google.service";
import { Patient } from "@/types/patient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DashboardHeader from "@/components/DashboardHeader";
import PatientDetailedProfileForm from "@/components/PatientDetailedProfileForm";

export default function PatientDetailedProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const patientId = searchParams.get("id");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.accessToken && patientId) {
      setIsLoading(true);
      const driveService = new GoogleDriveService(session.accessToken);
      driveService.readFile("patients.json").then(content => {
        if (content) {
          const allPatients = JSON.parse(content) as Patient[];
          setPatients(allPatients);
          const currentPatient = allPatients.find(p => p.id === patientId);
          if (currentPatient) {
            setPatient(currentPatient);
          }
        }
        setIsLoading(false);
      }).catch(error => {
        console.error("Error fetching patient details:", error);
        toast({ title: "Error al cargar datos", variant: "destructive" });
        setIsLoading(false);
      });
    }
  }, [session, patientId, toast]);

  const onSubmit = useCallback(async (data: any) => {
    if (!session?.accessToken || !patientId) return;

    setIsSubmitting(true);
    const driveService = new GoogleDriveService(session.accessToken);
    const updatedPatients = patients.map(p =>
      p.id === patientId ? { ...p, ...data } : p
    );

    try {
      await driveService.saveFile("patients.json", JSON.stringify(updatedPatients, null, 2));
      toast({ title: "Paciente Actualizado", description: "Los datos han sido guardados." });
      router.push("/patient-list");
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [session, patientId, patients, router, toast]);

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl p-6"><DashboardHeader /><p>Cargando datos del paciente...</p></div>;
  }

  if (!patient) {
    return <div className="container mx-auto max-w-4xl p-6"><DashboardHeader /><p>Paciente no encontrado.</p></div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <DashboardHeader />
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Ficha Detallada del Paciente</CardTitle>
          <CardDescription>Consulta o edita la información de tu paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientDetailedProfileForm patient={patient} onSubmit={onSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
