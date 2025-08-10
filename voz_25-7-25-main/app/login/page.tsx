"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bone">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg border border-module-border">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-semibold text-inforia">
            iNFORiA
          </h1>
          <p className="text-xl font-serif text-foreground">
            Inicia Sesión
          </p>
          <p className="text-sm text-muted-foreground font-sans">
            Accede a tu puesto de mando clínico
          </p>
        </div>
        <div className="pt-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full font-sans"
            variant="inforia"
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.37,19.27 7,17.24 7,14.5C7,11.76 9.37,9.73 12.19,9.73C13.8,9.73 15.09,10.36 15.83,11.05L17.78,9.1C16.16,7.56 14.38,6.83 12.19,6.83C8.43,6.83 5.18,9.75 5.18,14.5C5.18,19.25 8.43,22.17 12.19,22.17C16.22,22.17 21.5,19.33 21.5,14.5C21.5,13.25 21.45,12.13 21.35,11.1Z"
              />
            </svg>
            Continuar con Google
          </Button>
        </div>
      </div>
    </div>
  );
}
