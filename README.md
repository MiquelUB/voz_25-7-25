# INFORIA - Plataforma de Gestión Clínica

## 📋 Descripción del Proyecto

INFORIA es una plataforma integral de gestión clínica diseñada para profesionales de la salud mental. El sistema incluye gestión de pacientes, generación de informes con IA, calendario de citas, búsqueda universal y un centro de ayuda integrado.

## 🚀 Características Principales

### ✅ Módulos Implementados
- **Gestión de Pacientes**: Fichas completas con historial clínico
- **Generación de Informes con IA**: Integración con OpenRouter para informes automáticos
- **Calendario Integrado**: Programación y gestión de citas
- **Búsqueda Universal**: Búsqueda cruzada en pacientes, informes y citas
- **Centro de Ayuda**: FAQs y tutoriales en vídeo
- **Zero-Knowledge**: Informes guardados en Google Drive del usuario

### 🔧 Tecnologías Utilizadas
- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **IA**: OpenRouter API (GPT-4o-mini)
- **Autenticación**: Supabase Auth + Google OAuth
- **Almacenamiento**: Google Drive API

## 🛠️ Configuración del Entorno Local

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [OpenRouter](https://openrouter.ai)
- Cuenta en [Google Cloud Platform](https://console.cloud.google.com) (opcional)

### Pasos de Configuración

#### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd voz_25-7-25-main
```

#### 2. Instalar Dependencias
```bash
npm install
```

#### 3. Configurar Variables de Entorno

**Paso 1**: Copiar el archivo de ejemplo
```bash
cp env.example .env.local
```

**Paso 2**: Obtener las claves necesarias

**Supabase Configuration:**
1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a Settings > API
4. Copia la URL y la anon key

**OpenRouter API Key:**
1. Ve a [OpenRouter Keys](https://openrouter.ai/keys)
2. Crea una nueva API key
3. Copia la clave generada

**Google OAuth (Opcional):**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0

**Paso 3**: Rellenar el archivo `.env.local`
```bash
# Supabase Configuration
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key"

# OpenRouter API Key
OPENROUTER_API_KEY="tu-openrouter-key"

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

#### 4. Configurar Supabase

**Paso 1**: Instalar Supabase CLI
```bash
npm install -g supabase
```

**Paso 2**: Inicializar Supabase
```bash
supabase init
```

**Paso 3**: Iniciar Supabase localmente
```bash
supabase start
```

**Paso 4**: Aplicar migraciones
```bash
supabase db push
```

#### 5. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📚 Estructura del Proyecto

```
voz_25-7-25-main/
├── src/
│   ├── components/          # Componentes UI reutilizables
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios API
│   ├── hooks/              # Custom hooks
│   └── integrations/       # Configuraciones de servicios externos
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Migraciones de base de datos
├── docs/                   # Documentación del proyecto
└── components/             # Componentes adicionales
```

## 🔐 Seguridad y Variables de Entorno

### Variables Requeridas

| Variable | Descripción | Dónde Obtener |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Supabase Dashboard > Settings > API |
| `OPENROUTER_API_KEY` | Clave de API de OpenRouter | https://openrouter.ai/keys |

### Variables Opcionales

| Variable | Descripción | Cuándo Usar |
|----------|-------------|-------------|
| `GOOGLE_CLIENT_ID` | ID de cliente de Google OAuth | Si implementas autenticación con Google |
| `GOOGLE_CLIENT_SECRET` | Secreto de cliente de Google OAuth | Si implementas autenticación con Google |

### ⚠️ Notas de Seguridad

- **NUNCA** subas archivos `.env.local` al repositorio
- Las claves de API son secretas y personales
- Usa diferentes claves para desarrollo y producción
- El archivo `.gitignore` ya está configurado para proteger las variables

## 🚀 Despliegue

### Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático en cada push

### Despliegue en Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en Netlify Dashboard
3. Deploy automático en cada push

### Variables de Entorno en Producción

Configura estas variables en tu plataforma de despliegue:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
OPENROUTER_API_KEY=tu-openrouter-key
```

## 🧪 Testing

### Ejecutar Tests
```bash
npm run test
```

### Ejecutar Tests en Modo Watch
```bash
npm run test:watch
```

## 📖 Documentación

- [Configuración de Supabase](./docs/supabase-setup.md)
- [Integración con OpenRouter](./docs/openrouter-integration.md)
- [Módulo de Pacientes](./docs/patient-management.md)
- [Generación de Informes](./docs/report-generation.md)
- [Calendario Integrado](./docs/calendar-module-implementation.md)
- [Búsqueda Universal](./docs/universal-search-implementation.md)
- [Centro de Ayuda](./docs/support-module-implementation.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Verifica que todas las variables de entorno estén configuradas
2. Asegúrate de que las claves de API sean válidas
3. Revisa los logs del servidor de desarrollo
4. Consulta la documentación en la carpeta `docs/`

## 🔄 Actualizaciones

Para mantener el proyecto actualizado:

```bash
# Actualizar dependencias
npm update

# Actualizar Supabase
supabase update

# Aplicar nuevas migraciones
supabase db push
```

---

**INFORIA** - Transformando la gestión clínica con IA 🤖✨
