"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GoogleDriveService } from "@/src/services/google.service";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

export default function PatientListPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      const driveService = new GoogleDriveService(session.accessToken);

      const fetchPatients = async () => {
        setIsLoading(true);
        try {
          const fileContent = await driveService.readFile("patients.json");
          if (fileContent) {
            const parsedPatients = JSON.parse(fileContent) as Patient[];
            setPatients(parsedPatients);
          } else {
            // If the file doesn't exist, initialize with an empty array
            setPatients([]);
          }
        } catch (error) {
          console.error("Error fetching patients:", error);
          toast({
            title: "Error al cargar pacientes",
            description: "No se pudieron cargar los datos de los pacientes desde Google Drive.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchPatients();
    }
  }, [session, toast]);

  const handleDeletePatient = async (patientId: string) => {
    if (!session?.accessToken) return;

    const shouldDelete = confirm("¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.");
    if (!shouldDelete) return;

    const driveService = new GoogleDriveService(session.accessToken);
    const updatedPatients = patients.filter(p => p.id !== patientId);

    try {
        await driveService.saveFile("patients.json", JSON.stringify(updatedPatients, null, 2));
        setPatients(updatedPatients);
        toast({
            title: "Paciente Eliminado",
            description: "El paciente ha sido eliminado correctamente.",
        });
    } catch (error) {
        console.error("Error deleting patient:", error);
        toast({
            title: "Error al eliminar",
            description: "No se pudo eliminar el paciente. Inténtalo de nuevo.",
            variant: "destructive",
        });
    }
  };


  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
        <DashboardHeader />
        <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Lista de Pacientes</CardTitle>
                    <CardDescription>Gestiona tus pacientes existentes.</CardDescription>
                </div>
                <Link href="/new-patient" passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Añadir Paciente
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Cargando pacientes...</p>
                ) : patients.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/patient-detailed-profile?id=${patient.id}`} className="hover:underline">
                                            {patient.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{patient.email}</TableCell>
                                    <TableCell>{patient.phone}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/patient-detailed-profile?id=${patient.id}`} passHref>
                                            <Button variant="outline" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeletePatient(patient.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-10">
                        <p className="mb-4">No tienes pacientes registrados todavía.</p>
                        <Link href="/new-patient" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Añadir tu Primer Paciente
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
        <Toaster />
    </div>
  );
}
