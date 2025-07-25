import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { google } from "https://esm.sh/googleapis@126.0.1";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { provider_token, user_id } = await req.json();

    if (!provider_token) {
      return new Response(JSON.stringify({ error: "Missing provider_token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 1: Authenticate with Google
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: provider_token });
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Step 2: Create the Google Sheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: "[iNFORiA] CRM de Pacientes",
        },
        sheets: [
          {
            properties: {
              title: "Pacientes",
            },
            data: [
              {
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "Nombre" } },
                      { userEnteredValue: { stringValue: "Apellidos" } },
                      { userEnteredValue: { stringValue: "Email" } },
                      { userEnteredValue: { stringValue: "Teléfono" } },
                      { userEnteredValue: { stringValue: "Fecha de Nacimiento" } },
                      { userEnteredValue: { stringValue: "Género" } },
                      { userEnteredValue: { stringValue: "Dirección" } },
                      { userEnteredValue: { stringValue: "Motivo de la Consulta" } },
                      { userEnteredValue: { stringValue: "ID de Carpeta de Drive" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    const sheetId = spreadsheet.data.spreadsheetId;

    if (!sheetId) {
        throw new Error("Google Sheet ID not found after creation.");
    }

    // Step 3: Update the Profile in Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ google_sheet_id: sheetId })
      .eq("user_id", user_id);

    if (updateError) {
      throw new Error(`Supabase update error: ${updateError.message}`);
    }

    // Step 4: Handle Response
    return new Response(JSON.stringify({ success: true, sheetId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
