import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function PatientProfile() {
  const [editMode, setEditMode] = useState(false);
  const [patientData, setPatientData] = useState({
    nombreCompleto: "Paz García Fernández",
    telefono: "+34 656 789 012",
    telefonoEmergencia: "+34 911 234 567",
    email: "paz.garcia@email.com",
    direccion: "Calle Mayor 123, 3º B, 28001 Madrid",
    fechaNacimiento: "15/03/1988",
    edad: "37 años",
    sexo: "Femenino",
    dni: "12345678A",
    notasFijas: "Paciente con historial de ansiedad generalizada. Responde bien a técnicas de relajación. Prefiere citas matutinas. Ha mostrado progreso significativo en las últimas sesiones. Importante mantener constancia en los ejercicios de respiración."
  });

  const handleSave = () => {
    setEditMode(false);
    // Aquí iría la lógica para guardar los datos
  };

  const handleInputChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const etiquetas = ["Ansiedad", "TOC", "Terapia Cognitiva"];
  
  const historialInformes = [
    { fecha: "22/07/25", nombre: "Informe de Seguimiento" },
    { fecha: "15/07/25", nombre: "Evaluación Inicial" },
    { fecha: "08/07/25", nombre: "Informe de Progreso" },
    { fecha: "01/07/25", nombre: "Informe de Admisión" }
  ];

  const historialPagos = [
    { fecha: "22/07/25", estado: "Pagado", pagado: true },
    { fecha: "15/07/25", estado: "Pagado", pagado: true },
    { fecha: "08/07/25", estado: "Pendiente", pagado: false },
    { fecha: "01/07/25", estado: "Pagado", pagado: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      {/* Sub-Header */}
      <div className="bg-card border-b border-module-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-semibold text-foreground">
              Paz García
            </h1>
            <span className="text-muted-foreground font-sans">|</span>
            <span className="text-muted-foreground font-sans text-sm">
              Fecha de Alta: 01/07/2025
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-background hover:text-primary text-primary-foreground font-medium border border-primary transition-colors"
            >
              + Redactar Nuevo Informe
            </Button>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-background hover:text-primary text-primary-foreground font-medium border border-primary transition-colors"
            >
              Generar Dosier de Alta
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Datos del Paciente */}
          <Card className="h-fit">
            <CardHeader className="pb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-lg font-serif">Datos del Paciente</CardTitle>
              {/* Botones de Acción */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setEditMode(!editMode)}
                  className="bg-primary hover:bg-background hover:text-primary text-primary-foreground border border-primary transition-colors"
                >
                  {editMode ? "Cancelar" : "Editar Datos"}
                </Button>
                {editMode && (
                  <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-background hover:text-primary text-primary-foreground border border-primary transition-colors"
                  >
                    Guardar Cambios
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Datos Fijos */}
              <div>
                <h3 className="font-serif font-medium text-foreground mb-4">Datos Fijos</h3>
                <div className="space-y-3">
                  {Object.entries({
                    "Nombre Completo": "nombreCompleto",
                    "Teléfono": "telefono",
                    "Tel. Emergencia": "telefonoEmergencia", 
                    "Email": "email",
                    "Dirección": "direccion",
                    "F. Nacimiento": "fechaNacimiento",
                    "Edad": "edad",
                    "Sexo": "sexo",
                    "DNI/ID": "dni"
                  }).map(([label, field]) => (
                    <div key={field} className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {label}:
                      </Label>
                      {editMode ? (
                        <Input
                          value={patientData[field as keyof typeof patientData]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        <p className="text-sm text-foreground font-sans">
                          {patientData[field as keyof typeof patientData]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas Fijas */}
              <div>
                <h3 className="font-serif font-medium text-foreground mb-3">Notas Fijas</h3>
                {editMode ? (
                  <Textarea
                    value={patientData.notasFijas}
                    onChange={(e) => handleInputChange("notasFijas", e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground font-sans leading-relaxed bg-muted/30 p-4 rounded-md min-h-[120px]">
                    {patientData.notasFijas}
                  </p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Right Column - Actividad */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-serif">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Etiquetas */}
              <div>
                <h3 className="text-base font-serif font-medium mb-3 text-foreground">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {etiquetas.map((etiqueta, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {etiqueta}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Historial de Informes */}
              <div>
                <h3 className="text-base font-serif font-medium mb-3 text-foreground">Historial de Informes</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {historialInformes.map((informe, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <span className="font-sans text-sm text-foreground">
                        <span className="font-medium">{informe.fecha}:</span> {informe.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de Pagos */}
              <div>
                <h3 className="text-base font-serif font-medium mb-3 text-foreground">Historial de Pagos</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {historialPagos.map((pago, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                    >
                      <span className="font-sans text-sm text-foreground">
                        <span className="font-medium">{pago.fecha}:</span> {pago.estado}
                      </span>
                      <div className="flex items-center">
                        {pago.pagado ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}