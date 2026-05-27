-- ── Tabla site_settings ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read settings"  ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Auth write settings"   ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Auth update settings"  ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- También corregí el bucket name a "portfolio" en las policies de storage
-- Si ya corriste el SQL anterior con "projects", corré esto:
DO $$ BEGIN
  CREATE POLICY "Auth can upload to portfolio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view portfolio"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Auth can update portfolio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
