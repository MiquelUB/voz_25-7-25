import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const LOW_QUOTA_THRESHOLD = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find users with low quota who haven't been notified
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, informes_restantes')
      .lt('informes_restantes', LOW_QUOTA_THRESHOLD)
      .eq('notificacion_enviada', false);

    if (error) {
      console.error("Error fetching users:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch users." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "No users to notify." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    for (const user of users) {
      // Here you would implement the email sending logic.
      // For now, we'll just log it to the console.
      console.log(`Sending low quota notification to ${user.email}`);

      // Mark the user as notified
      await supabaseAdmin
        .from('profiles')
        .update({ notificacion_enviada: true })
        .eq('id', user.id);
    }

    return new Response(JSON.stringify({ message: "Notifications sent successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Unhandled error in notification function:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
