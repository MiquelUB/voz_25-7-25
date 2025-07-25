import React, { useState, useEffect } from "react";
import { Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavigationHeader } from "@/components/NavigationHeader";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const MyAccount = () => {
  const [profileData, setProfileData] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("No se pudo obtener la información del usuario.");
        setIsLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        setError("Error al cargar el perfil.");
        console.error(profileError);
      } else {
        setProfileData(data);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileData) return;

    const formData = new FormData(event.currentTarget);
    const updates = {
      nombre_completo: formData.get('fullName') as string,
      numero_colegiado: formData.get('collegiateNumber') as string,
      // Aquí podrías añadir más campos si los incluyes en el formulario y la tabla
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive",
      });
    } else {
      // Optimistic update of local state
      setProfileData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Éxito",
        description: "Datos actualizados correctamente.",
      });
      setIsEditing(false);
    }
  };

  const handlePlanChange = async (newPlan: 'Plan Profesional' | 'Plan Clínica') => {
    setIsChangingPlan(true);
    const newReportCount = newPlan === 'Plan Profesional' ? 100 : 150;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsChangingPlan(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ plan_actual: newPlan, informes_restantes: newReportCount })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el plan.",
        variant: "destructive",
      });
    } else {
      setProfileData(data);
      toast({
        title: "Plan actualizado",
        description: `Tu plan ha sido cambiado a ${newPlan}.`,
      });
    }
    setIsChangingPlan(false);
  };

  const totalReports = profileData?.plan_actual === 'Plan Clínica' ? 150 : 100;
  const reportsRemaining = profileData?.informes_restantes ?? 0;
  const reportsUsed = totalReports - reportsRemaining;
  const usagePercentage = (reportsUsed / totalReports) * 100;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Mi Cuenta</h1>
        
        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="professional">Mis Datos Profesionales</TabsTrigger>
            <TabsTrigger value="security">Cuenta y Seguridad</TabsTrigger>
            <TabsTrigger value="subscription">Suscripción y Facturación</TabsTrigger>
          </TabsList>

          {/* Tab 1: Mis Datos Profesionales */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Mis Datos Profesionales</CardTitle>
                <CardDescription>Gestiona tu información profesional y de contacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 {isLoading ? (
                  <>
                    <div className="flex flex-col items-center space-y-4">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <Skeleton className="h-10 w-40" />
                    </div>
                    <div className="grid gap-4 mt-6">
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                    </div>
                  </>
                ) : (
                  <>
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
                    <form onSubmit={handleUpdateProfile} className="grid gap-4">
                      <div>
                        <Label htmlFor="fullName" className="font-sans">Nombre Completo</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          defaultValue={profileData?.nombre_completo || ''}
                          className="font-sans"
                          readOnly={!isEditing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="collegiateNumber" className="font-sans">Nº de Colegiado</Label>
                        <Input
                          id="collegiateNumber"
                          name="collegiateNumber"
                          defaultValue={profileData?.numero_colegiado || ''}
                          className="font-sans"
                          readOnly={!isEditing}
                        />
                      </div>

                      {isEditing ? (
                        <Button type="submit" className="w-full font-sans">
                          Guardar Cambios
                        </Button>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} className="w-full font-sans" type="button">
                          Editar Perfil
                        </Button>
                      )}
                    </form>
                  </>
                )}
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
                {isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="font-sans text-sm text-muted-foreground">Plan Actual</Label>
                        <p className="font-serif text-lg font-medium">{profileData?.plan_actual}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="font-sans text-sm text-muted-foreground">Informes Usados</Label>
                          <span className="font-sans text-sm text-muted-foreground">
                            {reportsUsed} / {totalReports}
                          </span>
                        </div>
                        <Progress value={usagePercentage} className="h-3" />
                      </div>
                    </>
                  )}
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
                        disabled={profileData?.plan_actual === 'Plan Profesional' || isChangingPlan}
                        className="w-full mt-4 font-sans"
                        variant={profileData?.plan_actual === 'Plan Profesional' ? 'outline' : 'default'}
                        onClick={() => handlePlanChange('Plan Profesional')}
                      >
                        {profileData?.plan_actual === 'Plan Profesional' ? 'Plan Actual' : 'Cambiar a Profesional'}
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
                      <Button
                        disabled={profileData?.plan_actual === 'Plan Clínica' || isChangingPlan}
                        className="w-full mt-4 font-sans"
                        variant={profileData?.plan_actual === 'Plan Clínica' ? 'outline' : 'default'}
                        onClick={() => handlePlanChange('Plan Clínica')}
                      >
                        {profileData?.plan_actual === 'Plan Clínica' ? 'Plan Actual' : 'Actualizar a Clínica'}
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
                    {/* This part remains with mock data as invoice fetching is not in the scope */}
                    {[
                      { date: "01/12/2024", concept: "Plan Profesional - Diciembre", amount: "99€", id: "INV-001" },
                      { date: "01/11/2024", concept: "Plan Profesional - Noviembre", amount: "99€", id: "INV-002" },
                      { date: "01/10/2024", concept: "Plan Profesional - Octubre", amount: "99€", id: "INV-003" }
                    ].map((invoice) => (
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
