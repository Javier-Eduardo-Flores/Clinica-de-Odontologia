# Documentación del Sistema — Clínica Odontológica

Sistema de gestión para clínica odontológica. Permite gestionar pacientes, odontologos, citas, historial clínico y pagos con control de acceso por roles.

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.9 | Framework React (App Router + Server Actions) |
| React | 19.2.4 | UI |
| Supabase | — | Auth + Base de datos PostgreSQL |
| @supabase/ssr | 0.12.0 | Clientes Supabase para SSR/SSG |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | v4 | Estilos utilitarios |

> **Nota importante:** Next.js 16.2.9 renombró `middleware.ts` a `proxy.ts`. El archivo de protección de rutas se llama `proxy.ts` y exporta una función `proxy()`.

---

## Guía de instalación (para compañeros)

### Requisitos previos

- **Node.js** >= 18 (recomendado: 20 o 22)
- **npm** (viene con Node.js)
- **Git**
- Cuenta de GitHub con acceso al repositorio

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/Javier-Eduardo-Flores/Clinica-de-Odontologia.git
cd odontologia
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Configurar variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

**¿Dónde obtener estos valores?**
1. Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar el proyecto de la clínica
3. Ir a **Project Settings** > **API**
4. Copiar **Project URL** y **Project API keys** > **anon public**

> **NUNCA** subir `.env.local` al repositorio. Ya está en `.gitignore`.

### Paso 4 — Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`.

### Paso 5 — Verificar

1. Abrir `http://localhost:3000/login` — debe mostrar el formulario de login
2. Abrir `http://localhost:3000/register` — debe mostrar el formulario de registro
3. Intentar acceder a `http://localhost:3000/dashboard` sin sesión — debe redirigir a `/login`

---

## Variables de entorno

| Variable | Descripción | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API Key pública (anon) de Supabase | Sí |

---

## Estructura del proyecto

```
odontologia/
├── app/
│   ├── actions/
│   │   └── auth.ts                  # Server Actions: signIn, signUp, signOut
│   ├── dashboard/
│   │   └── page.tsx                 # Dashboard protegido + botón logout
│   ├── login/
│   │   └── page.tsx                 # Página de login
│   ├── register/
│   │   └── page.tsx                 # Página de registro (pacientes)
│   ├── layout.tsx                   # Layout raíz (fuentes, metadata)
│   ├── page.tsx                     # Home (pendiente personalizar)
│   └── globals.css                  # Variables CSS + Tailwind
├── utils/
│   └── supabase/
│       ├── client.ts                # Cliente Supabase (navegador)
│       ├── server.ts                # Cliente Supabase (servidor, cookies)
│       └── middleware.ts            # Helper: refresco de sesión
├── supabase/
│   └── trigger_profiles.sql         # Trigger + funciones SQL (respaldo)
├── proxy.ts                         # Proxy global (Next.js 16) — protección de rutas
├── .env.local                       # Variables de entorno (NO se sube a git)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── DOCUMENTACION.md                 # Este archivo
└── SESION.md                        # Notas de sesión (NO se sube a git)
```

---

## Arquitectura de autenticación

### Flujo de registro

1. El usuario completa el formulario en `/register`
2. `signUp()` (Server Action) envía los datos a `supabase.auth.signUp()` con metadata del paciente
3. Supabase crea el usuario en `auth.users`
4. El trigger `on_auth_user_created` se ejecuta automáticamente:
   - Inserta en `profiles` (siempre)
   - Inserta en `pacientes` (si rol = "paciente")
   - Inserta en `odontologos` (si rol = "doctor")
5. Redirige a `/login`

### Flujo de login

1. El usuario ingresa email y contraseña en `/login`
2. `signIn()` (Server Action) llama a `supabase.auth.signInWithPassword()`
3. Supabase crea la sesión y guarda cookies
4. Redirige a `/dashboard`

### Protección de rutas (`proxy.ts`)

- Ejecuta en **cada request** antes de llegar a las páginas
- Llama a `updateSession()` para refrescar la sesión de Supabase
- Verifica si hay usuario autenticado
- Si no hay usuario y la ruta empieza con `/dashboard` → redirige a `/login`
- Excluye assets estáticos (`_next/static`, imágenes, etc.)

---

## Base de datos (Supabase)

### Tabla: `profiles`

Tabla central que almacena los datos básicos de cada usuario.

```sql
CREATE TABLE profiles (
  id_profile UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(100) NOT NULL UNIQUE,
  nombre varchar(100) NOT NULL,
  apellido varchar(100) NOT NULL,
  rol varchar(50) NOT NULL CHECK (rol IN ('admin','doctor','paciente','recepcionista')),
  telefono varchar(20) NOT NULL,
  create_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `pacientes`

Datos adicionales de cada paciente.

```sql
CREATE TABLE pacientes (
  id_paciente UUID PRIMARY KEY REFERENCES profiles(id_profile),
  dni varchar(13) NOT NULL UNIQUE,
  primer_nombre varchar(100) NOT NULL,
  segundo_nombre varchar(100),
  primer_apellido varchar(100) NOT NULL,
  segundo_apellido varchar(100),
  telefono varchar(20) NOT NULL,
  estado smallint NOT NULL,
  correo varchar(100) NOT NULL UNIQUE,
  fecha_nacimiento Date NOT NULL,
  direccion Text,
  genero smallint,
  fecha_registro TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `odontologos`

Datos adicionales de cada odontólogo.

```sql
CREATE TABLE odontologos (
  id_odontologo UUID PRIMARY KEY REFERENCES profiles(id_profile),
  primer_nombre varchar(100) NOT NULL,
  segundo_nombre varchar(100),
  primer_apellido varchar(100) NOT NULL,
  segundo_apellido varchar(100),
  correo varchar(100) NOT NULL UNIQUE,
  direccion Text,
  fecha_nacimiento Date NOT NULL,
  estado smallint NOT NULL,
  sueldo NUMERIC(10,2) NOT NULL,
  dni varchar(13) NOT NULL UNIQUE,
  fecha_registro TIMESTAMP DEFAULT NOW()
);
```

### Trigger: `on_auth_user_created`

Se ejecuta automáticamente al crear un usuario nuevo en `auth.users`. Inserta en `profiles` y según el rol en `pacientes` u `odontologos`.

**Archivo de respaldo:** `supabase/trigger_profiles.sql`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id_profile, email, nombre, apellido, rol, telefono)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'primer_nombre', 'Sin nombre'),
    COALESCE(NEW.raw_user_meta_data ->> 'primer_apellido', 'Sin apellido'),
    COALESCE(NEW.raw_user_meta_data ->> 'rol', 'paciente'),
    COALESCE(NEW.raw_user_meta_data ->> 'telefono', '')
  );

  IF NEW.raw_user_meta_data ->> 'rol' = 'paciente' THEN
    INSERT INTO public.pacientes (...)
    -- inserta todos los campos del paciente
  ELSIF NEW.raw_user_meta_data ->> 'rol' = 'doctor' THEN
    INSERT INTO public.odontologos (...)
    -- inserta todos los campos del odontólogo
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Sistema de roles y permisos

### Jerarquía

```
admin  (nivel 0)
  └── recepcionista  (nivel 1)
        └── doctor / odontólogo  (nivel 2)
              └── paciente  (nivel 3)
```

**Regla:** un rol puede **leer** datos de su mismo nivel y niveles inferiores (hijos), pero **no** de niveles superiores (padres).

### Matriz de permisos RLS

#### Lectura (SELECT)

| ¿Quién ve? | admin | recepcionista | doctor | paciente |
|---|---|---|---|---|
| **admin** | ✅ | ✅ | ✅ | ✅ |
| **recepcionista** | ❌ | ✅ | ✅ | ✅ |
| **doctor** | ❌ | ❌ | ✅ | ✅ |
| **paciente** | ❌ | ❌ | ❌ | ✅ (solo sí mismo) |

#### Escritura (INSERT / UPDATE / DELETE)

| Acción | admin | recepcionista | doctor | paciente |
|---|---|---|---|---|
| **INSERT en Profiles** | ✅ | ❌ | ❌ | ❌ |
| **INSERT en Pacientes** | ✅ | ✅ | ✅ | ❌ |
| **INSERT en Odontologos** | ✅ | ❌ | ❌ | ❌ |
| **UPDATE propio perfil** | ✅ | ✅ | ✅ | ✅ |
| **UPDATE cualquier perfil** | ✅ | ❌ | ❌ | ❌ |
| **UPDATE Pacientes** | ✅ | ✅ | ✅ | ❌ (solo suyo) |
| **UPDATE Odontologos** | ✅ | ❌ | ✅ (solo suyo) | ❌ |
| **DELETE** | ✅ (todo) | ❌ | ❌ | ❌ |

### Políticas RLS de Profiles (ejecutadas)

**SELECT:**
- `"Cada usuario logueado ve su perfil"` — todos ven su propio perfil
- `"Un admin puede ver todos los profiles"` — admin ve todo
- `"Recepcionista ve perfiles hijos"` — recepcionista ve recepcionista, doctor, paciente
- `"Odontologo ve Odontologos y Pacientes"` — doctor ve doctor y paciente

**UPDATE:**
- `"Cada usuario logueado actualiza su perfil"` — consulta `profiles.rol` directamente (seguro, sin JWT)
- `"Un admin puede actualizar todos los usuarios"` — admin actualiza cualquier perfil

**INSERT:**
- `"Solo los admin puede insertar filas profile"` — solo admin. El trigger se salta RLS (SECURITY DEFINER)

**DELETE:**
- `"Solo los admins pueden borrar perfiles"` — solo admin

---

## Server Actions (app/actions/auth.ts)

| Función | Parámetros | Descripción |
|---|---|---|
| `signIn` | `(prevState, formData)` | Login con email y password. Redirige a `/dashboard` |
| `signUp` | `(prevState, formData)` | Registro de paciente. Rol fijo `"paciente"`. Redirige a `/login` |
| `signOut` | `()` | Cierra sesión. Redirige a `/login` |

### Validaciones en signUp

- Email: formato válido (regex)
- Password: mínimo 6 caracteres
- Campos obligatorios: email, password, primer_nombre, primer_apellido, dni, telefono, fecha_nacimiento

---

## Páginas del sistema

| Ruta | Descripción | Autenticación |
|---|---|---|
| `/` | Home (pendiente personalizar) | No |
| `/login` | Formulario de login | No |
| `/register` | Formulario de registro de paciente | No |
| `/dashboard` | Panel principal con botón logout | Sí (proxy protege) |

---

## Estado actual del proyecto

### Completado

- [x] Configuración inicial de Next.js 16 + Supabase
- [x] Clientes Supabase (server, client, middleware)
- [x] Proxy de protección de rutas (`proxy.ts`)
- [x] Server Actions: signIn, signUp, signOut
- [x] Página de login con enlace a registro
- [x] Página de registro con formulario completo de paciente
- [x] Trigger `on_auth_user_created` ejecutado en Supabase
- [x] Tablas creadas: profiles, pacientes, odontologos
- [x] Políticas RLS de profiles ejecutadas
- [x] Dashboard con botón de cerrar sesión
- [x] Registro end-to-end funcional (auth → profiles → pacientes)
- [x] Proxy verificado funcionando (redirect sin sesión)

### Pendiente

- [ ] Configurar Site URL y Redirect URLs en Supabase Auth
- [ ] Políticas RLS de `pacientes` (SELECT, INSERT, UPDATE, DELETE)
- [ ] Políticas RLS de `odontologos` (SELECT, INSERT, UPDATE, DELETE)
- [ ] Dashboard por roles (menú condicional según el rol)
- [ ] Ajustar página home (`app/page.tsx`) para redirigir según sesión
- [ ] CRUD de pacientes (admin/recepcionista)
- [ ] CRUD de odontologos (solo admin)
- [ ] Tablas adicionales: `citas`, `historial_clinico`, `pagos`
- [ ] Personalización visual (colores, tipografía, branding de la clínica)

---

## Notas técnicas

### Next.js 16 — Cambio de middleware a proxy

En Next.js 16, la convención `middleware.ts` fue deprecada y renombrada a `proxy.ts`:

```diff
- // middleware.ts ( Next.js < 16)
+ // proxy.ts (Next.js 16+)

- export function middleware(request: NextRequest) {
+ export function proxy(request: NextRequest) {
    // ...
  }
```

### Tailwind CSS v4 — Clases de borde

En Tailwind v4, las clases de borde se separan:

```html
<!-- Incorrecto (no funciona en v4) -->
<div class="border-b-amber-700">

<!-- Correcto -->
<div class="border-b border-amber-700">
```

### Colores personalizados (globals.css)

Los colores se definen en `globals.css` con variables CSS y se mapean a Tailwind:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Para agregar un color nuevo (ej: `primary`):

```css
:root {
  --primary: #0284c7;
}

@theme inline {
  --color-primary: var(--primary);
}
```

Uso: `bg-primary`, `text-primary`, etc.
