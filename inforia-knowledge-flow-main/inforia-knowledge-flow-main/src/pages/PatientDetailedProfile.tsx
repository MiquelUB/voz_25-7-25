import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DashboardHeader from "@/components/DashboardHeader";
import { Edit, Plus, FileText, Calendar, Trash2, User, Tag, FileSignature, Clock, CreditCard, FileCheck, X } from "lucide-react";

const PatientDetailedProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState({
    name: "Paz García",
    phone: "+34 600 123 456",
    email: "paz.garcia@email.com",
    birthDate: "15/03/1985",
    address: "Calle Mayor 123, 28001 Madrid",
    emergencyContact: "María García - +34 600 654 321",
    tags: ["Ansiedad", "Terapia Cognitiva"],
    notes: "Paciente colaborativa con buena evolución en el tratamiento de ansiedad generalizada."
  });

  const [paymentData, setPaymentData] = useState([
    { date: "15/07/2025", amount: "75€", method: "Transferencia", status: "Pagado" },
    { date: "08/07/2025", amount: "75€", method: "Efectivo", status: "Pagado" },
    { date: "01/07/2025", amount: "75€", method: "Tarjeta", status: "Pagado" }
  ]);

  const handleSaveChanges = () => {
    setIsEditing(false);
    // TODO: Implement save logic
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // TODO: Restore original data
  };

  const handleDeletePatient = () => {
    // TODO: Implement delete logic
    console.log("Eliminar paciente");
  };

  const handleAcudirInforme = () => {
    // TODO: Implement acudir informe logic
    console.log("Acudir informe");
  };

  const handlePaymentChange = (index: number, field: string, value: string) => {
    const updatedPayments = paymentData.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    );
    setPaymentData(updatedPayments);
  };

  const handleAddTag = () => {
    const newTagName = prompt("Escribe la nueva etiqueta:");
    if (newTagName && newTagName.trim() && !patientData.tags.includes(newTagName.trim())) {
      setPatientData({
        ...patientData,
        tags: [...patientData.tags, newTagName.trim()]
      });
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setPatientData({
      ...patientData,
      tags: patientData.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <DashboardHeader />

      {/* Page Sub-Header */}
      <div className="border-b border-module-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Patient Name & Sign-up Date */}
            <div className="flex items-center space-x-4">
              <h1 className="font-serif text-2xl font-medium text-foreground">
                Paz García
              </h1>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Fecha de Alta: 01/07/2025</span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Redactar Nuevo Informe
              </Button>
              <Button variant="inforia">
                <FileText className="mr-2 h-4 w-4" />
                Generar Dosier de Alta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Patient Data Card */}
          <Card className="border border-module-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl font-medium text-foreground flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Datos del Paciente
                </CardTitle>
                {!isEditing ? (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="hover:bg-bone hover:text-primary"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Datos
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm"
                      onClick={handleSaveChanges}
                    >
                      Guardar Cambios
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Datos Fijos Section */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-foreground">Datos Fijos</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Nombre Completo
                    </label>
                    {isEditing ? (
                      <Input 
                        value={patientData.name}
                        onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{patientData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <Input 
                        value={patientData.phone}
                        onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{patientData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <Input 
                        value={patientData.email}
                        onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{patientData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Fecha de Nacimiento
                    </label>
                    {isEditing ? (
                      <Input 
                        value={patientData.birthDate}
                        onChange={(e) => setPatientData({...patientData, birthDate: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{patientData.birthDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Dirección
                    </label>
                    {isEditing ? (
                      <Input 
                        value={patientData.address}
                        onChange={(e) => setPatientData({...patientData, address: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{patientData.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Contacto de Emergencia
                    </label>
                    {isEditing ? (
                      <Input 
                        value={patientData.emergencyContact}
                        onChange={(e) => setPatientData({...patientData, emergencyContact: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground">{patientData.emergencyContact}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Etiquetas Section */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-foreground flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patientData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={handleAddTag}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Notas Fijas Section */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-foreground flex items-center">
                  <FileSignature className="mr-2 h-4 w-4" />
                  Notas Fijas
                </h3>
                {isEditing ? (
                  <Textarea 
                    value={patientData.notes}
                    onChange={(e) => setPatientData({...patientData, notes: e.target.value})}
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-foreground bg-muted/50 p-3 rounded-md">
                    {patientData.notes}
                  </p>
                )}
              </div>

              {/* Delete Button - Only in Edit Mode */}
              {isEditing && (
                <div className="pt-4 border-t border-module-border">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Paciente
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que quieres eliminar a este paciente? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeletePatient}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirmar Eliminación
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Activity Card */}
          <Card className="border border-module-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-xl font-medium text-foreground flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Actividad
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Historial de Informes Section */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-foreground flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Historial de Informes
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {[
                    { date: "15/07/2025", title: "Informe de Seguimiento", status: "Completado" },
                    { date: "08/07/2025", title: "Evaluación Inicial", status: "Completado" },
                    { date: "01/07/2025", title: "Informe de Admisión", status: "Completado" }
                  ].map((report, index) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      className="w-full h-auto p-3 bg-muted/50 hover:bg-muted border border-module-border rounded-md justify-start"
                      onClick={() => console.log(`Abriendo informe: ${report.title}`)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          <p className="font-medium text-foreground">{report.title}</p>
                          <p className="text-sm text-muted-foreground">{report.date}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {report.status}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Historial de Pagos Section */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-foreground flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Historial de Pagos
                </h3>
                <div className="space-y-3">
                  {paymentData.map((payment, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-md border border-module-border">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">
                                Fecha
                              </label>
                              <Input 
                                value={payment.date}
                                onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">
                                Importe
                              </label>
                              <Input 
                                value={payment.amount}
                                onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">
                                Método
                              </label>
                              <Input 
                                value={payment.method}
                                onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">
                                Estado
                              </label>
                              <Input 
                                value={payment.status}
                                onChange={(e) => handlePaymentChange(index, 'status', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{payment.amount}</p>
                            <p className="text-sm text-muted-foreground">{payment.date} - {payment.method}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {payment.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDetailedProfile;
