-- Tabla para mensajes de contacto del portfolio
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Constraints to prevent spam
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'contact_messages' AND constraint_name = 'name_length'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT name_length    CHECK (char_length(name)    BETWEEN 1 AND 200),
      ADD CONSTRAINT email_length   CHECK (char_length(email)   BETWEEN 5 AND 254),
      ADD CONSTRAINT message_length CHECK (char_length(message) BETWEEN 1 AND 5000);
  END IF;
END $$;

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
