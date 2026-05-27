-- Tabla para mensajes de contacto del portfolio
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede enviar un mensaje
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_messages' AND policyname = 'Anyone can send messages'
  ) THEN
    CREATE POLICY "Anyone can send messages"
      ON contact_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Solo usuarios autenticados (admin) pueden leer
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_messages' AND policyname = 'Auth can read messages'
  ) THEN
    CREATE POLICY "Auth can read messages"
      ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Solo usuarios autenticados pueden eliminar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_messages' AND policyname = 'Auth can delete messages'
  ) THEN
    CREATE POLICY "Auth can delete messages"
      ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;
