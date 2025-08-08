import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const PLAN_QUOTA = 100; // Define the plan quota here

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
      return new Response(JSON.stringify({ error: "Authentication token is missing." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser(authToken);

    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication failed." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Reset the report count and update the billing cycle date
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        informes_restantes: PLAN_QUOTA,
        //billing_cycle_start: new Date().toISOString(), // Uncomment when billing is implemented
      })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return new Response(JSON.stringify({ error: "Failed to renew plan." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "Plan renewed successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Unhandled error in renew function:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
