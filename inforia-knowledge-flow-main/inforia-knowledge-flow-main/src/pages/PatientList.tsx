import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
import { gapi } from 'gapi-script';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  folderId: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    gapi.load('client');
    const fetchPatients = async () => {
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
        const formattedPatients: Patient[] = values.map((row: any[], index: number) => ({
          id: `${sheetId}-${index}`,
          nombre: row[0] || '',
          apellidos: row[1] || '',
          email: row[2] || '',
          telefono: row[3] || '',
          folderId: row[8] || '',
        }));

        setPatients(formattedPatients);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    `${patient.nombre} ${patient.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Listado de Pacientes
          </h1>
          <Link to="/new-patient">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Nuevo Paciente
            </Button>
          </Link>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.nombre} {patient.apellidos}
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.telefono}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/patient-profile/${patient.folderId}`}>
                              Ver Ficha
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Crear Informe</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No se encontraron pacientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
