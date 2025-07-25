import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from 'https://deno.land/x/googleapis/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider_token } = await req.json()
    if (!provider_token) {
      throw new Error('No provider_token provided')
    }

    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: provider_token })

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client })

    const spreadsheet = await sheets.spreadsheets.create({
      properties: {
        title: '[iNFORiA] CRM de Pacientes',
      },
    })

    const sheetId = spreadsheet.data.spreadsheetId
    if (!sheetId) {
      throw new Error('Failed to create sheet')
    }

    const values = [
      ['Nombre', 'Apellidos', 'Email', 'Teléfono', 'Fecha de Nacimiento', 'Género', 'Dirección', 'Motivo de la Consulta', 'ID de Carpeta de Drive'],
    ]
    const resource = {
      values,
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      resource,
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheet_id: sheetId })
      .eq('id', user.id)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, sheetId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
