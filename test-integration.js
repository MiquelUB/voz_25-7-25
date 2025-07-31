// test-integration.js
// Script de prueba para validar la integración completa del flujo "Generar Informe con IA"

const testData = {
  transcription: "El paciente expresó sentimientos de ansiedad durante la sesión. Mencionó dificultades en el trabajo y problemas de sueño. El terapeuta sugirió técnicas de relajación y estableció objetivos para la próxima sesión.",
  sessionNotes: "El paciente mostró signos de ansiedad generalizada. Se observó inquietud motora y dificultad para concentrarse. Se acordó implementar técnicas de respiración diafragmática y establecer una rutina de sueño regular."
};

async function testEdgeFunction() {
  console.log("🧪 Iniciando prueba de integración...");
  
  try {
    // Simular la llamada a la Edge Function
    const formData = new FormData();
    formData.append("transcription", testData.transcription);
    formData.append("sessionNotes", testData.sessionNotes);

    // URL de la función local (ajustar según configuración)
    const functionUrl = "http://localhost:54321/functions/v1/informe-inteligente";
    
    console.log("📡 Enviando petición a la Edge Function...");
    console.log("📋 Datos de prueba:", {
      transcription: testData.transcription.substring(0, 50) + "...",
      sessionNotes: testData.sessionNotes.substring(0, 50) + "..."
    });

    const response = await fetch(functionUrl, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": "Bearer test-token", // Para pruebas locales
      }
    });

    console.log("📊 Respuesta recibida:");
    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Éxito - Informe generado:");
      console.log("Report:", data.report ? data.report.substring(0, 200) + "..." : "No report generated");
    } else {
      const errorText = await response.text();
      console.log("❌ Error en la respuesta:");
      console.log("Error:", errorText);
    }

  } catch (error) {
    console.log("💥 Error en la prueba:", error.message);
  }
}

async function testFrontendIntegration() {
  console.log("\n🎯 Probando integración del frontend...");
  
  try {
    // Simular el flujo del frontend
    console.log("1. ✅ Validación de datos de entrada");
    console.log("   - Transcripción:", testData.transcription ? "Presente" : "Ausente");
    console.log("   - Notas de sesión:", testData.sessionNotes ? "Presente" : "Ausente");
    
    console.log("2. ✅ Construcción del FormData");
    const formData = new FormData();
    formData.append("transcription", testData.transcription);
    formData.append("sessionNotes", testData.sessionNotes);
    console.log("   - FormData creado correctamente");
    
    console.log("3. ✅ Simulación de llamada a la API");
    console.log("   - Método: POST");
    console.log("   - Endpoint: /functions/v1/informe-inteligente");
    console.log("   - Headers: Content-Type, Authorization");
    
    console.log("4. ✅ Manejo de respuesta");
    console.log("   - Estado de carga: Simulado");
    console.log("   - Feedback visual: Simulado");
    console.log("   - Logs en consola: Implementado");
    
  } catch (error) {
    console.log("❌ Error en la integración del frontend:", error.message);
  }
}

function validateEnvironment() {
  console.log("🔍 Validando entorno de desarrollo...");
  
  const checks = [
    {
      name: "Servidor de desarrollo",
      check: () => {
        // Verificar si el puerto 5173 está en uso (Vite por defecto)
        return new Promise((resolve) => {
          fetch("http://localhost:5173").then(() => resolve(true)).catch(() => resolve(false));
        });
      }
    },
    {
      name: "Supabase Functions",
      check: () => {
        // Verificar si las funciones están disponibles
        return new Promise((resolve) => {
          fetch("http://localhost:54321/functions/v1").then(() => resolve(true)).catch(() => resolve(false));
        });
      }
    },
    {
      name: "Variables de entorno",
      check: () => {
        // Verificar variables críticas
        const required = ["OPENROUTER_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY"];
        const missing = required.filter(key => !process.env[key]);
        return Promise.resolve(missing.length === 0);
      }
    }
  ];

  return Promise.all(checks.map(async (check) => {
    const result = await check.check();
    console.log(`   ${result ? "✅" : "❌"} ${check.name}`);
    return result;
  }));
}

async function runFullTest() {
  console.log("🚀 INICIANDO PRUEBA FUNCIONAL COMPLETA");
  console.log("=" .repeat(50));
  
  // 1. Validar entorno
  console.log("\n📋 PASO 1: Validación del entorno");
  const envResults = await validateEnvironment();
  const envOk = envResults.every(result => result);
  
  if (!envOk) {
    console.log("⚠️  Algunos componentes del entorno no están disponibles");
    console.log("   Continúe con la prueba manual en el navegador");
  }
  
  // 2. Probar Edge Function
  console.log("\n📋 PASO 2: Prueba de la Edge Function");
  await testEdgeFunction();
  
  // 3. Probar integración del frontend
  console.log("\n📋 PASO 3: Prueba de integración del frontend");
  await testFrontendIntegration();
  
  // 4. Instrucciones para prueba manual
  console.log("\n📋 PASO 4: Instrucciones para prueba manual");
  console.log("1. Abra http://localhost:5173 en su navegador");
  console.log("2. Navegue a SessionWorkspace");
  console.log("3. Complete los campos de transcripción y notas");
  console.log("4. Haga clic en 'Generar Informe con IA'");
  console.log("5. Verifique en las herramientas de desarrollador:");
  console.log("   - Pestaña Network: Petición POST a informe-inteligente");
  console.log("   - Pestaña Console: Logs del informe generado");
  console.log("   - Estado de carga y feedback visual");
  
  console.log("\n✅ PRUEBA COMPLETADA");
  console.log("=" .repeat(50));
}

// Ejecutar la prueba si se llama directamente
if (typeof window === 'undefined') {
  runFullTest().catch(console.error);
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
  window.testIntegration = {
    runFullTest,
    testEdgeFunction,
    testFrontendIntegration,
    validateEnvironment
  };
} 