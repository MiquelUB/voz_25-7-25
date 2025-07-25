
import React, { useState, useEffect } from "react";
import { Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavigationHeader } from "@/components/NavigationHeader";
import { supabase } from "@/integrations/supabase/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("professional");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfileData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error("Error fetching profile data:", error);
      } else {
        setProfileData(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.provider_token) {
        const createCrm = async () => {
          try {
            const { error } = await supabase.functions.invoke('create-google-crm', {
              body: { provider_token: session.provider_token },
            });

            if (error) throw error;

            toast({
              title: "Éxito",
              description: "Tu CRM de Google ha sido creado y conectado.",
            });
            fetchProfileData(); // Refresh profile data
          } catch (error) {
            toast({
              title: "Error",
              description: "No se pudo crear tu CRM de Google. " + error.message,
              variant: "destructive",
            });
          }
        };
        createCrm();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  const handleConnectToGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        redirectTo: window.location.href,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar la conexión con Google.",
        variant: "destructive",
      });
    }
  };


  // Mock data
  const mockInvoices = [
    { date: "01/12/2024", concept: "Plan Profesional - Diciembre", amount: "99€", id: "INV-001" },
    { date: "01/11/2024", concept: "Plan Profesional - Noviembre", amount: "99€", id: "INV-002" },
    { date: "01/10/2024", concept: "Plan Profesional - Octubre", amount: "99€", id: "INV-003" }
  ];

  const usagePercentage = profileData ? (profileData.reports_used / profileData.reports_total) * 100 : 0;

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
                      defaultValue={profileData?.full_name || ''}
                      className="font-sans"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collegiateNumber" className="font-sans">Nº de Colegiado</Label>
                    <Input
                      id="collegiateNumber"
                      defaultValue={profileData?.collegiate_number || ''}
                      className="font-sans"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clinicName" className="font-sans">Nombre de la Consulta</Label>
                    <Input
                      id="clinicName"
                      defaultValue={profileData?.clinic_name || ''}
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
                    value={profileData?.email || ''}
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

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium font-serif">Integraciones</h3>
                  {profileData?.google_sheet_id ? (
                    <div className="mt-4 flex items-center">
                      <p className="font-sans text-green-600">✅ Conectado con Google Workspace</p>
                    </div>
                  ) : (
                    <Button onClick={handleConnectToGoogle} className="w-full font-sans mt-4">
                      Conectar con Google Workspace
                    </Button>
                  )}
                </div>
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
                    <p className="font-serif text-lg font-medium">{profileData?.current_plan}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-sans text-sm text-muted-foreground">Informes Usados</Label>
                      <span className="font-sans text-sm text-muted-foreground">
                        {profileData?.reports_used} / {profileData?.reports_total}
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
