# Obrix Monorepo

Monorepo con dos aplicaciones: **app** (público) y **admin** (dashboard).

## 🏗️ Estructura

```
obrix-monorepo/
├── apps/
│   ├── app/          # App pública
│   └── admin/        # Dashboard admin
├── packages/
│   ├── ui/           # Componentes compartidos
│   └── config/       # Types y constantes
└── netlify/functions/ # Funciones serverless
```

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install
cd packages/config && npm install && npm run build
cd ../ui && npm install && npm run build
cd ../../apps/app && npm install --legacy-peer-deps
cd ../admin && npm install --legacy-peer-deps

# Desarrollo
npm run dev      # Ambas apps
npm run dev:app  # Solo app pública (:5173)
npm run dev:admin # Solo admin (:5174)

# Build
npm run build

# Seed
npm run seed
```

## 🌐 Deploy Netlify

### App Pública (obrix.netlify.app)
- **Base directory**: `apps/app`
- **Build command**: `npm install --legacy-peer-deps && npm run build`
- **Publish directory**: `apps/app/dist`

### Admin (obrix-admin.netlify.app)
- **Base directory**: `apps/admin`
- **Build command**: `npm install --legacy-peer-deps && npm run build`
- **Publish directory**: `apps/admin/dist`

### Variables de Entorno
```
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
```

## 🎨 Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth + Database)
- Zustand (State)
- Lucide React (Icons)

## 📦 Paquetes Compartidos

- `@obrix/ui` - Button, Card, etc.
- `@obrix/config` - Types TypeScript compartidos

## 🔐 Roles

- owner
- admin
- constructor
- client
- viewer

## Cuentas Demo

```
Owner: owner@obrix.com / owner123
Admin: admin@obrix.com / admin123
```
