# Estructura del Monorepo Obrix

## ✅ Archivos Creados

### 📁 Root
- `pnpm-workspace.yaml` - Configuración del workspace
- `.npmrc` - Configuración npm
- `package.json` - Scripts principales del monorepo
- `README.md` - Documentación principal

### 📦 Paquetes Compartidos

#### `/packages/config`
```
packages/config/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    └── types.ts (User, Project, Task, etc.)
```

#### `/packages/ui`
```
packages/ui/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── Button.tsx
    ├── Card.tsx
    └── styles.css
```

### 🌐 Apps

#### `/apps/app` (Público)
```
apps/app/
├── package.json
├── netlify.toml ⭐
├── index.html
├── .env
└── public/
    ├── _redirects ⭐
    └── obrix-logo.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── pages/ (existente)
    └── components/ (existente)
```

#### `/apps/admin` (Dashboard)
```
apps/admin/
├── package.json
├── netlify.toml ⭐
├── index.html
├── .env
└── public/
    ├── _redirects ⭐
    └── obrix-logo.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    └── lib/
        └── supabase.ts
```

### ⚡ Netlify Functions
```
netlify/functions/
└── monthly-report.ts
```

### 🌱 Scripts
```
scripts/
└── seed.ts
```

## 🎯 Archivos Clave

### Netlify Config (cada app tiene uno)

**apps/app/netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "apps/app"
```

**apps/admin/netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "apps/admin"
```

### _redirects (SPA routing)
Ambas apps tienen:
```
/* /index.html 200
```

## 📋 package.json Locations

1. `/package.json` - Root (scripts principales)
2. `/packages/config/package.json` - Config package
3. `/packages/ui/package.json` - UI package
4. `/apps/app/package.json` - App pública
5. `/apps/admin/package.json` - Admin dashboard

## 🚀 Comandos Disponibles

Desde root:
```bash
npm run dev          # Ambas apps
npm run dev:app      # Solo pública
npm run dev:admin    # Solo admin
npm run build        # Build todo
npm run seed         # Seed database
```

## 📊 Base de Datos

Las migraciones ya están aplicadas en Supabase con:
- Tabla `users` (con roles)
- Tabla `projects` (con members en JSONB)
- Tabla `tasks` (con assignees)
- Tabla `bug_reports`
- RLS policies configuradas

## ✨ Componentes Compartidos

De `@obrix/ui`:
- Button (primary, secondary, danger, ghost)
- Card (con opción neon)

De `@obrix/config`:
- Types: User, Project, Task, BugReport, etc.
- Constants: NEON_ACCENT, ADMIN_ROLES
- Helpers: hasAdminAccess()

## 🔑 Variables de Entorno

Ambas apps necesitan:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Ya están en `.env` en cada carpeta.
