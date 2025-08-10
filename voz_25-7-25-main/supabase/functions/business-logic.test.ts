import { test, assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve as informeInteligente } from "./informe-inteligente/index.ts";
import { serve as renovacionAnticipada } from "./renovacion-anticipada/index.ts";
import { serve as notificacionCuotaBaja } from "./notificacion-cuota-baja/index.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock user for testing
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
};

// Mock request function
const mockRequest = (method: string, body?: any, headers?: any) => {
  return new Request("http://localhost", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
};

test("informe-inteligente: should fail if quota is zero", async () => {
  // Setup: ensure user has 0 reports
  await supabase.from("profiles").update({ informes_restantes: 0 }).eq("id", mockUser.id);

  const req = mockRequest("POST", {}, { Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` });
  const res = await informeInteligente(req);
  const json = await res.json();

  assertEquals(res.status, 403);
  assertEquals(json.error, "No te quedan informes disponibles.");
});

test("renovacion-anticipada: should reset quota", async () => {
  // Setup: ensure user has 0 reports
  await supabase.from("profiles").update({ informes_restantes: 0 }).eq("id", mockUser.id);

  const req = mockRequest("POST", {}, { Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` });
  const res = await renovacionAnticipada(req);
  const json = await res.json();

  assertEquals(res.status, 200);
  assertEquals(json.message, "Plan renewed successfully.");

  // Verify quota is reset
  const { data } = await supabase.from("profiles").select("informes_restantes").eq("id", mockUser.id).single();
  assertEquals(data?.informes_restantes, 100);
});

test("notificacion-cuota-baja: should find users with low quota", async () => {
  // Setup: ensure user has low quota and is not notified
  await supabase.from("profiles").update({ informes_restantes: 5, notificacion_enviada: false }).eq("id", mockUser.id);

  const req = mockRequest("POST");
  const res = await notificacionCuotaBaja(req);
  const json = await res.json();

  assertEquals(res.status, 200);
  assertEquals(json.message, "Notifications sent successfully.");

  // Verify user is marked as notified
  const { data } = await supabase.from("profiles").select("notificacion_enviada").eq("id", mockUser.id).single();
  assertEquals(data?.notificacion_enviada, true);
});
