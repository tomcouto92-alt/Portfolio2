-- ============================================================
-- Panna Rabbit Portfolio — Supabase Setup
-- Corré esto en: supabase.com → tu proyecto → SQL Editor
-- ============================================================

-- 1. Tabla de proyectos
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  metric      TEXT NOT NULL,
  image_url   TEXT,
  "order"     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Datos iniciales (los mismos del diseño original)
INSERT INTO projects (title, category, description, metric, "order") VALUES
  ('Paid Social Systems',  'Performance Creative', 'High-converting paid social campaigns blending premium art direction with direct-response performance.', '+38% ROAS',    1),
  ('Creator Commerce',     'UGC / TikTok',         'Social-first creative systems designed for creator-led brands and TikTok Shop ecosystems.',             '12M+ Views',   2),
  ('Brand Identity',       'Branding',              'Editorial identity systems balancing clarity, luxury, and conversion-focused storytelling.',            'Global Launch', 3),
  ('Pitch Deck Design',    'Presentation',          'Investor-grade storytelling decks for creator economy startups and modern agencies.',                   '$5M Raised',   4);

-- 3. Row Level Security: solo lectura pública (el portfolio es público)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON projects
  FOR SELECT USING (true);

-- 4. Storage bucket para imágenes
-- (Hacé esto desde el Dashboard de Supabase → Storage → New Bucket)
-- Nombre: projects
-- Public: true
