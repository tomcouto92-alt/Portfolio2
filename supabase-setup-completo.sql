-- ============================================================
-- SETUP COMPLETO — correlo en Supabase → SQL Editor
-- ============================================================

-- 1. Tabla de proyectos (solo si no existe)
CREATE TABLE IF NOT EXISTS projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT NOT NULL,
  metric         TEXT NOT NULL,
  image_url      TEXT,
  case_study_url TEXT,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add case_study_url if missing (for existing databases)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'projects'
      AND column_name  = 'case_study_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN case_study_url TEXT;
  END IF;
END $$;

-- Migración: si la tabla ya existía con columna "order", renombrarla
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'projects'
      AND column_name  = 'order'
  ) THEN
    ALTER TABLE projects RENAME COLUMN "order" TO sort_order;
  END IF;
END $$;

-- 2. Tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS — Proyectos
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth update projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth delete projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. RLS — Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth write settings" ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth update settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Storage — bucket "portfolio"
DO $$ BEGIN
  CREATE POLICY "Auth upload portfolio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public view portfolio" ON storage.objects FOR SELECT TO public USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth update portfolio" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth delete portfolio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Datos iniciales (solo si la tabla está vacía)
INSERT INTO projects (title, category, description, metric, sort_order)
SELECT * FROM (VALUES
  ('Paid Social Systems', 'Performance Creative', 'High-converting paid social campaigns blending premium art direction with direct-response performance.', '+38% ROAS',    1),
  ('Creator Commerce',    'UGC / TikTok',         'Social-first creative systems designed for creator-led brands and TikTok Shop ecosystems.',             '12M+ Views',   2),
  ('Brand Identity',      'Branding',              'Editorial identity systems balancing clarity, luxury, and conversion-focused storytelling.',            'Global Launch', 3),
  ('Pitch Deck Design',   'Presentation',          'Investor-grade storytelling decks for creator economy startups and modern agencies.',                   '$5M Raised',   4)
) AS v(title, category, description, metric, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_sort_order      ON projects (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC);

-- Auto-update updated_at on site_settings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
