import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { gapi } from "https://esm.sh/gapi-script@1.2.0";

serve(async (req) => {
  const { provider_token } = await req.json();

  try {
    // Initialize GAPI client
    await new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client.init({
          apiKey: 'YOUR_GOOGLE_API_KEY', // Replace with your Google API Key
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        }).then(resolve).catch(reject);
      });
    });
    gapi.client.setToken({ access_token: provider_token });

    // Create Google Sheet
    const sheetResponse = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: "Mi CRM de Pacientes",
      },
    });
    const spreadsheetId = sheetResponse.result.spreadsheetId;

    // Create Google Drive Folder
    const driveResponse = await gapi.client.drive.files.create({
      resource: {
        name: "Pacientes",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    const folderId = driveResponse.result.id;

    return new Response(
      JSON.stringify({
        spreadsheetId,
        folderId,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
