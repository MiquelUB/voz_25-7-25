import { useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Save, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date | undefined;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  profession: string;
  referredBy: string;
  tags: string[];
  notes: string;
}

const NewPatient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: undefined,
    appointmentDate: undefined,
    appointmentTime: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    profession: "",
    referredBy: "",
    tags: [],
    notes: ""
  });

  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read date parameter from URL and set appointment date
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      // Parse date components to avoid timezone issues
      const [year, month, day] = dateParam.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day); // month is 0-indexed
      setPatientData(prev => ({
        ...prev,
        appointmentDate: selectedDate
      }));
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !patientData.tags.includes(newTag.trim())) {
      setPatientData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPatientData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSavePatient = async () => {
    setIsSubmitting(true);
    
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Paciente guardado",
      description: `La ficha de ${patientData.firstName} ${patientData.lastName} ha sido creada exitosamente.`,
    });
    
    setIsSubmitting(false);
    navigate("/patient-list");
  };

  const handleSaveAndCreateReport = async () => {
    setIsSubmitting(true);
    
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Paciente guardado",
      description: `Ficha creada. Redirigiendo al espacio de trabajo...`,
    });
    
    setIsSubmitting(false);
    navigate("/session-workspace?newPatient=true");
  };

  const isFormValid = patientData.firstName && patientData.lastName && patientData.email && patientData.phone && patientData.gender && patientData.birthDate;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
            Alta de Nuevo Paciente
          </h1>
          <p className="text-muted-foreground font-sans">
            Crea una nueva ficha de paciente con toda la información necesaria para comenzar el tratamiento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-sans">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={patientData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Nombre del paciente"
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-sans">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={patientData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Apellidos del paciente"
                      className="font-sans"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={patientData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+34 612 345 678"
                      className="font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sans">Fecha de Nacimiento *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-sans",
                            !patientData.birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {patientData.birthDate ? (
                            format(patientData.birthDate, "d 'de' MMMM 'de' yyyy", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={patientData.birthDate}
                          onSelect={(date) => setPatientData(prev => ({ ...prev, birthDate: date }))}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sans">Género *</Label>
                    <Select onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="font-sans">
                        <SelectValue placeholder="Selecciona género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="no-binario">No binario</SelectItem>
                        <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="font-sans">Dirección</Label>
                  <Input
                    id="address"
                    value={patientData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Dirección completa"
                    className="font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="font-sans">Profesión</Label>
                  <Input
                    id="profession"
                    value={patientData.profession}
                    onChange={(e) => handleInputChange("profession", e.target.value)}
                    placeholder="Profesión del paciente"
                    className="font-sans"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Información de Cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sans">Fecha de Cita</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-sans",
                            !patientData.appointmentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {patientData.appointmentDate ? (
                            format(patientData.appointmentDate, "d 'de' MMMM 'de' yyyy", { locale: es })
                          ) : (
                            <span>Selecciona fecha de cita</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={patientData.appointmentDate}
                          onSelect={(date) => setPatientData(prev => ({ ...prev, appointmentDate: date }))}
                          initialFocus
                          locale={es}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime" className="font-sans">Hora de Cita</Label>
                    <Select onValueChange={(value) => handleInputChange("appointmentTime", value)}>
                      <SelectTrigger className="font-sans">
                        <SelectValue placeholder="Selecciona hora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="09:30">09:30</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="10:30">10:30</SelectItem>
                        <SelectItem value="11:00">11:00</SelectItem>
                        <SelectItem value="11:30">11:30</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="12:30">12:30</SelectItem>
                        <SelectItem value="13:00">13:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="16:30">16:30</SelectItem>
                        <SelectItem value="17:00">17:00</SelectItem>
                        <SelectItem value="17:30">17:30</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                        <SelectItem value="18:30">18:30</SelectItem>
                        <SelectItem value="19:00">19:00</SelectItem>
                        <SelectItem value="19:30">19:30</SelectItem>
                        <SelectItem value="20:00">20:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="font-sans">Nombre del Contacto</Label>
                    <Input
                      id="emergencyContact"
                      value={patientData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Nombre completo"
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="font-sans">Teléfono de Emergencia</Label>
                    <Input
                      id="emergencyPhone"
                      value={patientData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                      placeholder="+34 612 345 678"
                      className="font-sans"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referredBy" className="font-sans">Derivado por</Label>
                  <Input
                    id="referredBy"
                    value={patientData.referredBy}
                    onChange={(e) => handleInputChange("referredBy", e.target.value)}
                    placeholder="Médico, otro profesional, autoreferen..."
                    className="font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Etiquetas</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {patientData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="font-sans">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nueva etiqueta..."
                      className="font-sans"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-sans">Notas Iniciales</Label>
                  <Textarea
                    id="notes"
                    value={patientData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observaciones iniciales, motivo de consulta..."
                    className="font-sans min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSaveAndCreateReport}
                  disabled={!isFormValid || isSubmitting}
                  variant="inforia"
                  className="w-full font-sans"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Guardando..." : "Guardar y Crear 1er Informe"}
                </Button>
                
                <Button
                  onClick={handleSavePatient}
                  variant="outline"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full font-sans"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Solo Guardar Ficha
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground font-sans">
                <p>• Los campos marcados con * son obligatorios</p>
                <p>• Puedes añadir y editar la información más tarde</p>
                <p>• Las etiquetas ayudan a categorizar y buscar pacientes</p>
                <p>• El contacto de emergencia es opcional pero recomendado</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewPatient;