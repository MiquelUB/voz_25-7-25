

````markdown
# iNFORiA - Puesto de Mando Clínico

![Estado del Proyecto](https://img.shields.io/badge/Estado-Prototipo_Funcional_Avanzado-9cf)

[cite_start]El Asistente Clínico y de Negocio diseñado para devolverle al terapeuta el control de su profesión y la paz mental para ejercerla. [cite: 6]

---

## 🧭 Sobre el Proyecto

iNFORiA es una herramienta SaaS pensada para psicólogos autónomos y pequeñas clínicas. [cite_start]Nuestra misión es erradicar el trabajo administrativo tedioso y repetitivo que causa estrés y burnout en los profesionales de la salud mental. [cite: 5, 7]

[cite_start]Este proyecto se centra en nuestro usuario, el **"Emprendedor Accidental"**: un excelente profesional clínico forzado a ser empresario sin desearlo. [cite: 10, 11] [cite_start]Les ofrecemos **"Liberación Profesional"** a través de la automatización inteligente, permitiéndoles dedicarse a lo que realmente importa: sus pacientes. [cite: 55, 387]

## 🛠️ Stack Tecnológico

Este proyecto está construido con un stack moderno, escalable y enfocado en una experiencia de desarrollo y de usuario de alta calidad.

* **Framework:** [Vite](https://vitejs.dev/) + [React](https://react.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Backend y BBDD:** [Supabase](https://supabase.com/) (PostgreSQL, Auth)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/) sobre Radix UI
* **Formularios:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
* **Routing:** [React Router](https://reactrouter.com/)

---

## 🚀 Guía de Inicio Rápido

Para levantar el entorno de desarrollo local, sigue estos pasos.

### **Prerrequisitos**

* Node.js (v18 o superior)
* Bun (como gestor de paquetes e instalador)

### **Instalación**

1.  **Clona el repositorio:**
    ```sh
    git clone <URL_DEL_REPOSITORIO>
    cd inforia-saas
    ```

2.  **Instala las dependencias:**
    ```sh
    bun install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto, copiando el contenido de `.env.example` (si existe) o usando esta plantilla. Deberás rellenarlo con las credenciales de Supabase.

    ```env
    VITE_SUPABASE_URL="[https://pwhyrqjmzhkuguvfkrkc.supabase.co](https://pwhyrqjmzhkuguvfkrkc.supabase.co)"
    VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aHlycWptemhrdWd1dmZrcmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzIzMDAsImV4cCI6MjA2ODc0ODMwMH0.mhtia0GDpibMGP_Yg9c-mz6FKZGuVCoyINQOu32hc9c"
    ```

4.  **Inicia el servidor de desarrollo:**
    ```sh
    bun run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

---

## 🏗️ Estructura de Archivos

La estructura del proyecto está organizada para mantener una separación clara de responsabilidades.

````

/src
├── components/       \# Componentes reutilizables de la aplicación
│   ├── ui/           \# Componentes base de shadcn/ui (Button, Card, etc.)
│   └── MainDashboard.tsx \# Componentes complejos y de layout
├── hooks/            \# Hooks personalizados (ej. use-toast, use-mobile)
├── integrations/     \# Configuración de clientes de servicios externos
│   └── supabase/
│       ├── client.ts \# Cliente de Supabase
│       └── types.ts  \# Tipos autogenerados de la BBDD
├── lib/              \# Funciones de utilidad (ej. utils.ts para cn)
├── pages/            \# Componentes que representan las páginas/rutas
└── App.tsx           \# Router principal de la aplicación

```

## 🔑 Principios de Arquitectura

* **Modelo Zero-Knowledge:** La privacidad es fundamental. Los datos de los pacientes (fichas, informes) **NO** se almacenan en nuestros servidores. [cite_start]La aplicación actúa como una pasarela segura que lee y escribe directamente en el Google Workspace del psicólogo (Google Sheets y Google Drive). [cite: 404, 405]
* [cite_start]**CRM de Administración:** La base de datos en Supabase se utiliza exclusivamente para gestionar a **nuestros clientes** (los psicólogos): sus perfiles, estado de suscripción y consumo de informes. [cite: 408, 409]
* **Sistema de Diseño Consistente:** Toda la interfaz se construye a partir de los componentes definidos en `src/components/ui`, asegurando una total consistencia con el **Manual de Marca** y la identidad visual de iNFORiA.

```
