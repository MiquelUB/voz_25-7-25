import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Eye, Edit, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastSession: string;
  status: "Activo" | "Inactivo" | "En pausa";
  totalSessions: number;
  tags: string[];
}
const mockPatients: Patient[] = [{
  id: "1",
  name: "María García López",
  email: "maria.garcia@email.com",
  phone: "+34 612 345 678",
  lastSession: "2024-01-20",
  status: "Activo",
  totalSessions: 12,
  tags: ["Ansiedad", "Terapia Cognitiva"]
}, {
  id: "2",
  name: "Carlos Ruiz Mendez",
  email: "carlos.ruiz@email.com",
  phone: "+34 678 901 234",
  lastSession: "2024-01-18",
  status: "Activo",
  totalSessions: 8,
  tags: ["Depresión", "Mindfulness"]
}, {
  id: "3",
  name: "Ana Fernández Silva",
  email: "ana.fernandez@email.com",
  phone: "+34 645 123 789",
  lastSession: "2023-12-15",
  status: "En pausa",
  totalSessions: 15,
  tags: ["Trauma", "EMDR"]
}, {
  id: "4",
  name: "Javier Moreno Castro",
  email: "javier.moreno@email.com",
  phone: "+34 699 876 543",
  lastSession: "2024-01-19",
  status: "Activo",
  totalSessions: 6,
  tags: ["Pareja", "Sistémica"]
}];
const PatientList = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200";
      case "En pausa":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactivo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
              Gestión de Pacientes
            </h1>
            <p className="text-muted-foreground font-sans">
              Administra y supervisa todos tus pacientes desde un solo lugar
            </p>
          </div>
          
          <Link to="/new-patient">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre, email o teléfono..." className="pl-10" />
              </div>
              <Button variant="outline" className="font-sans">
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        

        {/* Patients List */}
        <Card>
          <CardHeader>
            
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {mockPatients.map(patient => <div key={patient.id} className="p-6 hover:bg-secondary/50 transition-calm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg" alt={patient.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-sans">
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <Link to={`/patient-detailed-profile?id=${patient.id}`} className="font-serif text-lg font-medium text-foreground hover:text-primary transition-calm">
                          {patient.name}
                        </Link>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground font-sans">
                          <span>{patient.email}</span>
                          <span>•</span>
                          <span>{patient.phone}</span>
                          <span>•</span>
                          <span>{patient.totalSessions} sesiones</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                          {patient.tags.map(tag => <Badge key={tag} variant="outline" className="font-sans">
                              {tag}
                            </Badge>)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground font-sans">
                        Última sesión: {new Date(patient.lastSession).toLocaleDateString('es-ES')}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link to={`/patient-detailed-profile?id=${patient.id}`} className="w-full flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Ficha
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/session-workspace?patientId=${patient.id}`} className="w-full flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Nueva Sesión
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>;
};
export default PatientList;