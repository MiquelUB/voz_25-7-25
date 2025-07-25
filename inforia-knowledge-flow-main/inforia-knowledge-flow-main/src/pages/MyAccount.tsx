
import React, { useState } from "react";
import { Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavigationHeader } from "@/components/NavigationHeader";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("professional");

  // Mock data
  const mockUser = {
    name: "Dr. María González",
    collegiateNumber: "28-4567-89",
    clinicName: "Centro de Psicología Integral",
    email: "maria.gonzalez@email.com",
    currentPlan: "Plan Profesional",
    reportsUsed: 34,
    reportsTotal: 100
  };

  const mockInvoices = [
    { date: "01/12/2024", concept: "Plan Profesional - Diciembre", amount: "99€", id: "INV-001" },
    { date: "01/11/2024", concept: "Plan Profesional - Noviembre", amount: "99€", id: "INV-002" },
    { date: "01/10/2024", concept: "Plan Profesional - Octubre", amount: "99€", id: "INV-003" }
  ];

  const usagePercentage = (mockUser.reportsUsed / mockUser.reportsTotal) * 100;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Mi Cuenta</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="professional" className="font-sans">
              Mis Datos Profesionales
            </TabsTrigger>
            <TabsTrigger value="security" className="font-sans">
              Cuenta y Seguridad
            </TabsTrigger>
            <TabsTrigger value="subscription" className="font-sans">
              Suscripción y Facturación
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Mis Datos Profesionales */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Mis Datos Profesionales</CardTitle>
                <CardDescription className="font-sans">
                  Gestiona tu información profesional y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="font-sans">
                    Cambiar Foto de Perfil
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="fullName" className="font-sans">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      defaultValue={mockUser.name}
                      className="font-sans"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collegiateNumber" className="font-sans">Nº de Colegiado</Label>
                    <Input
                      id="collegiateNumber"
                      defaultValue={mockUser.collegiateNumber}
                      className="font-sans"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clinicName" className="font-sans">Nombre de la Consulta</Label>
                    <Input
                      id="clinicName"
                      defaultValue={mockUser.clinicName}
                      className="font-sans"
                    />
                  </div>
                </div>

                <Button className="w-full font-sans">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Cuenta y Seguridad */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Cuenta y Seguridad</CardTitle>
                <CardDescription className="font-sans">
                  Gestiona tu contraseña y configuración de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-sans">Email de acceso</Label>
                  <Input
                    value={mockUser.email}
                    readOnly
                    className="bg-muted font-sans"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currentPassword" className="font-sans">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="font-sans"
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword" className="font-sans">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="font-sans"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="font-sans">Repetir Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="font-sans"
                  />
                </div>

                <Button className="w-full font-sans">
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Suscripción y Facturación */}
          <TabsContent value="subscription">
            <div className="space-y-8">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Suscripción Actual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Plan Actual</Label>
                    <p className="font-serif text-lg font-medium">{mockUser.currentPlan}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-sans text-sm text-muted-foreground">Informes Usados</Label>
                      <span className="font-sans text-sm text-muted-foreground">
                        {mockUser.reportsUsed} / {mockUser.reportsTotal}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Change Plan */}
              <div>
                <h3 className="font-serif text-xl font-medium mb-4">Cambiar de Plan</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Plan Profesional */}
                  <Card className="relative">
                    <CardHeader>
                      <CardTitle className="font-serif">Plan Profesional</CardTitle>
                      <CardDescription className="font-sans">
                        <span className="text-2xl font-bold text-foreground">99€</span>
                        <span className="text-muted-foreground"> / mes</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 font-sans text-sm">
                        <li>• 100 informes/mes</li>
                        <li>• Soporte estándar</li>
                        <li>• Integración básica</li>
                      </ul>
                      <Button
                        disabled
                        className="w-full mt-4 font-sans"
                        variant="outline"
                      >
                        Plan Actual
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Plan Clínica */}
                  <Card className="relative border-primary">
                    <CardHeader>
                      <CardTitle className="font-serif">Plan Clínica</CardTitle>
                      <CardDescription className="font-sans">
                        <span className="text-2xl font-bold text-foreground">149€</span>
                        <span className="text-muted-foreground"> / mes</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 font-sans text-sm">
                        <li>• 150 informes/mes</li>
                        <li>• Soporte prioritario</li>
                        <li>• Integración avanzada</li>
                        <li>• Funciones de equipo</li>
                      </ul>
                      <Button className="w-full mt-4 font-sans">
                        Actualizar a Clínica
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Invoice History */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Historial de Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div className="space-y-1">
                          <p className="font-sans text-sm font-medium">{invoice.concept}</p>
                          <p className="font-sans text-sm text-muted-foreground">{invoice.date}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-sans font-medium">{invoice.amount}</span>
                          <Button size="sm" variant="outline" className="font-sans">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyAccount;
