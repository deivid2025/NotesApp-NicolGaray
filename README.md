# 🗒️ Nicol Garay App — Tablero de Tareas

Tablero de tareas con estilo **doodle oscuro y juguetón**: notas adhesivas en zigzag, colores neón, fuentes hechas a mano (Caveat + Patrick Hand) y un sistema de logros inspirado en **Bleach** con diálogos contextuales de Ichigo, Rukia, Orihime y Uryū.

> **Idioma:** 100 % en español.
> **Diseño:** totalmente responsive — móvil, tablet y escritorio. Nada se desborda.

---

## ✨ Características

- **Notas adhesivas en zigzag** con rotación, sombra dura y conectores curvos punteados.
- **Completar tareas** con un toque: tachado, sello «HECHO» y confeti.
- **Perfil editable**: nombre, avatar (emoji) y color de acento.
- **Sistema de logros Bleach** (10 logros en 3 tiers: Común / Especial / Extraordinario) con efectos visuales y **sonidos originales** generados con Web Audio API.
- **Diálogos contextuales** de personajes (al completar, fallar, racha, logro, etc.).
- **Racha diaria**, línea temporal del día, vista de mañana/tarde/noche, peek de mañana.
- **Modo enfoque**, filtros, búsqueda, etiquetas, prioridades, recurrencia, subtareas.
- **Deshacer** (Ctrl/Cmd+Z), atajos de teclado, tema oscuro/claro.
- **Persistencia local** (localStorage) — tus tareas no se pierden al recargar.
- **Totalmente responsive**: 390 px en móvil → 420 px en tablet → 460 px en escritorio con fondo ambiental decorativo.

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, webpack) |
| Lenguaje | TypeScript + JSX |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Iconos | lucide-react |
| Fuentes | Caveat + Patrick Hand (next/font/google) |
| Sonidos | Web Audio API (tonos originales, sin assets externos) |
| Persistencia | localStorage (sin backend) |
| Despliegue | Docker (standalone) / Vercel |

---

## 🚀 Desarrollo local

Requisitos: **Node.js 18+** y **Bun** (recomendado) o npm.

```bash
# 1. Instalar dependencias
bun install        # o: npm install

# 2. Iniciar el servidor de desarrollo
bun run dev        # o: npm run dev

# 3. Abrir http://localhost:3000
```

### Scripts disponibles

| Comando | Acción |
|---------|--------|
| `bun run dev` | Servidor de desarrollo en `localhost:3000` |
| `bun run build` | Build de producción (standalone) |
| `bun run start` | Servir el build de producción |
| `bun run lint` | Verificar calidad del código con ESLint |

---

## 📦 Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout raíz + fuentes + metadata
│   ├── page.tsx            # Página única → <TaskBoard />
│   └── globals.css         # Estilos globales + variables de tema
├── components/
│   ├── TaskBoard.jsx       # Componente principal (tablero completo)
│   ├── BleachOverlay.jsx   # Overlays de logros + diálogos Bleach
│   └── ui/                 # Componentes shadcn/ui
├── lib/
│   ├── bleach.js           # Personajes, diálogos, logros + sonidos
│   ├── utils.ts            # Utilidades (cn, etc.)
│   └── db.ts               # Cliente Prisma (si se usa DB)
└── hooks/
    ├── use-toast.ts
    └── use-mobile.ts

public/
└── app-icon.png            # Icono de la app

Dockerfile                  # Build multi-stage para producción
docker-compose.yml          # Orquestación Docker
.env.example                # Variables de entorno de ejemplo
```

---

## 🐙 Subir a GitHub (código fuente limpio)

El `.gitignore` ya excluye todo lo que no es parte de la app (`node_modules/`, `.next/`, logs, variables de entorno, y también archivos internos del entorno de desarrollo). Sigue estos pasos:

### 1. Crear el repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. **Repository name:** `nicol-garay-app` (o el que prefieras)
3. **Description:** `Tablero de tareas con estilo doodle y logros inspirados en Bleach`
4. Elige **Public** o **Private** según prefieras
5. **NO** marques "Add a README", ".gitignore" ni "license" (ya los tienes)
6. Click **Create repository**

### 2. Inicializar y subir desde tu computadora

```bash
# En la raíz del proyecto:

# Inicializar git (si no existe)
git init
git branch -M main

# Ver qué se va a subir (verifica que NO aparezcan node_modules, .next, skills/, etc.)
git status
git add .

# Primer commit
git commit -m "🎉 Nicol Garay App — tablero de tareas con logros Bleach"

# Conectar con GitHub (cambia USUARIO por tu usuario)
git remote add origin https://github.com/USUARIO/nicol-garay-app.git
git push -u origin main
```

### 3. Verificar que el repo quedó limpio

Después del push, en GitHub solo debes ver:
- `src/` — código fuente
- `public/` — assets (app-icon.png)
- `prisma/` — schema (si lo usas)
- Archivos de config: `package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`
- Docker: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`
- `README.md`, `.gitignore`

**NO** deben aparecer: `node_modules/`, `.next/`, `skills/`, `download/`, `tests/`, `dev.log`, `.env`, `worklog.md`.

> 💡 Si accidentalmente ya subiste archivos basura, límpialos del repo con:
> ```bash
> git rm -r --cached node_modules .next skills download tests
> git commit -m "🧹 Limpiar archivos basura del repo"
> git push
> ```

---

## 🚢 Despliegue

### Opción A — Dockploy (Docker) ⭐ recomendada

[Dockploy](https://dockploy.io) despliega contenedores Docker fácilmente.

1. **Conecta tu repositorio** de GitHub en Dockploy.
2. **Tipo de despliegue:** Dockerfile (Dockploy detecta el `Dockerfile` automáticamente).
3. **Puerto:** `3000`
4. **Variables de entorno:** copia el contenido de `.env.example` (la app funciona sin variables obligatorias — usa localStorage).
5. **Desplegar.** Dockploy construirá la imagen y la servirá.

El `Dockerfile` incluido es multi-stage:
- **Build:** instala dependencias con Bun y compila con `next build` (modo standalone).
- **Runtime:** imagen slim, usuario no-root, healthcheck en `/api/health`.

#### Despliegue manual con Docker

```bash
# Construir la imagen
docker build -t nicol-garay-app .

# Ejecutar el contenedor
docker run -p 3000:3000 --name nicol-garay-app nicol-garay-app

# Abrir http://localhost:3000
```

#### Con docker-compose

```bash
docker compose up -d
```

### Opción B — Vercel (sin Docker)

1. Sube el repo a GitHub (ver arriba).
2. Ve a [vercel.com/new](https://vercel.com/new) e importa el repositorio.
3. Framework: **Next.js** (detectado automáticamente).
4. Click **Deploy**. ¡Listo! Vercel construye y despliega en segundos.

---

## 📝 Notas sobre la licencia de Bleach

Bleach y sus personajes son © Tite Kubo / Shueisha / Pierrot. Esta app usa **únicamente referencias de texto** (nombres de personajes + líneas de diálogo originales escritas en el espíritu de los personajes). **No** se incluyen imágenes, sprites, audio ni artwork con copyright. Para publicación comercial, reemplaza los nombres/referencias de personajes por personajes originales u obtén la licencia correspondiente.

---

## 👤 Autora

**Nicol Garay**

---

_HECHA CON 💛 — doodles, notas adhesivas y energía de Shinigami._
