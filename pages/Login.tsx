import { supabase } from "@/integrations/supabase/supabaseClient";
import { Button } from "@/components/ui/button";

const Login = () => {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/my-account`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            Inicia Sesión
          </h1>
          <p className="mt-2 text-muted-foreground font-sans">
            Accede a tu cuenta para gestionar tus pacientes y sesiones.
          </p>
        </div>
        <Button
          onClick={handleGoogleLogin}
          className="w-full font-sans"
          variant="outline"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.37,19.27 7,17.24 7,14.5C7,11.76 9.37,9.73 12.19,9.73C13.8,9.73 15.09,10.36 15.83,11.05L17.78,9.1C16.16,7.56 14.38,6.83 12.19,6.83C8.43,6.83 5.18,9.75 5.18,14.5C5.18,19.25 8.43,22.17 12.19,22.17C16.22,22.17 21.5,19.33 21.5,14.5C21.5,13.25 21.45,12.13 21.35,11.1Z"
            />
          </svg>
          Continuar con Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
