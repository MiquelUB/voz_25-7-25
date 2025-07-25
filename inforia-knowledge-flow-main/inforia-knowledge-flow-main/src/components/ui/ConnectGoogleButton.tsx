import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const ConnectGoogleButton = () => {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        redirectTo: `${window.location.origin}/my-account`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
  };

  return (
    <Button onClick={handleGoogleSignIn} className="w-full font-sans">
      Conectar con Google Workspace
    </Button>
  );
};

export default ConnectGoogleButton;
