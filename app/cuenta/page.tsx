"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DashboardHeader from "@/components/DashboardHeader";

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anonymous key is not defined in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CuentaPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [informesRestantes, setInformesRestantes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("informes_restantes")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({ title: "Error al cargar el perfil", variant: "destructive" });
        } else {
          setInformesRestantes(data.informes_restantes);
        }
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, toast]);

  const handleRenew = async () => {
    setIsSubmitting(true);
    // Call the new Edge Function
    const { error } = await supabase.functions.invoke("renovacion-anticipada");

    if (error) {
      console.error("Error invoking renew function:", error);
      toast({ title: "Error al renovar el plan", variant: "destructive" });
    } else {
      toast({ title: "Plan Renovado", description: "Tu cuota de informes ha sido restablecida." });
      // Refresh the count
      const { data } = await supabase
        .from("profiles")
        .select("informes_restantes")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setInformesRestantes(data.informes_restantes);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <DashboardHeader />
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Mi Cuenta</CardTitle>
          <CardDescription>Gestiona tu suscripción y tu información.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Informes Restantes:</p>
                <p className="text-2xl font-bold">{informesRestantes ?? "N/A"}</p>
              </div>
              <Button
                onClick={handleRenew}
                disabled={isSubmitting || (informesRestantes !== null && informesRestantes > 0)}
              >
                {isSubmitting ? "Renovando..." : "Renovar Plan Ahora"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
