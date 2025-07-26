
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/supabaseClient";
import { Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useToast } from "@/hooks/use-toast";

const MyAccount = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("professional");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) {
          toast({ title: "Error", description: "No se pudo cargar el perfil.", variant: "destructive" });
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
      if (error) {
        toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
      } else {
        toast({ title: "Éxito", description: "Perfil actualizado correctamente." });
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

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
                <form onSubmit={handleProfileUpdate}>
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={profile?.avatar_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"}
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
                      <Label htmlFor="full_name" className="font-sans">Nombre Completo</Label>
                      <Input
                        id="full_name"
                        value={profile?.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="font-sans"
                      />
                    </div>

                    <div>
                      <Label htmlFor="collegiate_number" className="font-sans">Nº de Colegiado</Label>
                      <Input
                        id="collegiate_number"
                        value={profile?.collegiate_number || ""}
                        onChange={(e) => setProfile({ ...profile, collegiate_number: e.target.value })}
                        className="font-sans"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clinic_name" className="font-sans">Nombre de la Consulta</Label>
                      <Input
                        id="clinic_name"
                        value={profile?.clinic_name || ""}
                        onChange={(e) => setProfile({ ...profile, clinic_name: e.target.value })}
                        className="font-sans"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-sans mt-6">
                    Guardar Cambios
                  </Button>
                </form>
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
                    value={profile?.email || ""}
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
            {/* ... (keep mock data for now) ... */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyAccount;
