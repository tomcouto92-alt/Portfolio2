# Panna Rabbit — Portfolio de Tomas Couto

Portfolio personal con Next.js 14, Tailwind CSS y Supabase.

## Stack

- **Next.js 14** — App Router
- **Tailwind CSS** — estilos
- **Supabase** — base de datos + storage de imágenes

---

## Setup rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. Andá a **SQL Editor** y pegá el contenido de `supabase-setup.sql`
3. Andá a **Storage → New Bucket** → nombre: `projects`, público: ✅
4. Copiá el archivo de variables de entorno:

```bash
cp .env.local.example .env.local
```

5. Completá `.env.local` con tus keys (Settings → API en Supabase):

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Agregar proyectos

**Opción A — Desde Supabase Dashboard:**
- Andá a Table Editor → `projects`
- Insertá filas con título, categoría, descripción, métrica
- Subí imágenes a Storage → `projects`

**Opción B — SQL:**
```sql
INSERT INTO projects (title, category, description, metric, image_url, "order")
VALUES ('Nuevo Proyecto', 'Categoría', 'Descripción...', 'Resultado', 'https://url-imagen.jpg', 5);
```

---

## Deploy

Recomendado: [Vercel](https://vercel.com)
1. Push a GitHub
2. Importá en Vercel
3. Agregá las env vars en Vercel → Settings → Environment Variables
