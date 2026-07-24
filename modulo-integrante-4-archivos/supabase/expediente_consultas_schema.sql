-- =====================================================================
-- MÓDULO: Expediente Clínico y Atención de Consultas (Integrante 4)
-- Ejecutar completo en Supabase SQL Editor.
--
-- Supone que ya existen en el proyecto:
--   profiles(id_profile, rol)
--   pacientes(id_paciente)            -- FK -> profiles.id_profile
--   odontologos(id_odontologo)        -- FK -> profiles.id_profile
--   citas(id_cita, id_usuario, ...)   -- id_usuario FK -> profiles.id_profile (paciente)
--   tratamiento(id_tratamiento, nombre, precio)
--
-- Si algún nombre no coincide exactamente con tu base real, ajústalo
-- antes de ejecutar (avísame y lo corrijo).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS expediente (
  id_expediente        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_paciente           UUID NOT NULL UNIQUE REFERENCES pacientes(id_paciente) ON DELETE CASCADE,
  alergias              TEXT,
  patologias_previas    TEXT,
  medicacion_habitual   TEXT,
  notas_generales       TEXT,
  fecha_creacion        TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultas (
  id_consulta      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cita          UUID NOT NULL REFERENCES citas(id_cita) ON DELETE RESTRICT,
  id_odontologo    UUID NOT NULL REFERENCES odontologos(id_odontologo) ON DELETE RESTRICT,
  fecha            TIMESTAMP NOT NULL DEFAULT NOW(),
  diagnostico      TEXT,
  evolucion        TEXT
);

CREATE TABLE IF NOT EXISTS detalle_consultas (
  id_detalle_consulta  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_consulta          UUID NOT NULL REFERENCES consultas(id_consulta) ON DELETE CASCADE,
  id_tratamiento       UUID NOT NULL REFERENCES tratamiento(id_tratamiento) ON DELETE RESTRICT,
  cantidad             INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  notas                TEXT
);

CREATE INDEX IF NOT EXISTS idx_consultas_id_cita ON consultas(id_cita);
CREATE INDEX IF NOT EXISTS idx_consultas_id_odontologo ON consultas(id_odontologo);
CREATE INDEX IF NOT EXISTS idx_detalle_consultas_id_consulta ON detalle_consultas(id_consulta);

-- Trigger simple para mantener fecha_actualizacion en expediente
CREATE OR REPLACE FUNCTION public.set_fecha_actualizacion_expediente()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_expediente_fecha_actualizacion ON expediente;
CREATE TRIGGER trg_expediente_fecha_actualizacion
  BEFORE UPDATE ON expediente
  FOR EACH ROW
  EXECUTE FUNCTION public.set_fecha_actualizacion_expediente();

-- ---------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
--    Regla del módulo: lectura estricta para pacientes (solo lo suyo),
--    lectura/escritura total para doctor y admin. Recepcionista NO
--    tiene acceso a datos clínicos.
-- ---------------------------------------------------------------------

ALTER TABLE expediente ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_consultas ENABLE ROW LEVEL SECURITY;

-- Helper implícito reutilizado en varias políticas:
--   EXISTS (SELECT 1 FROM profiles WHERE id_profile = auth.uid() AND rol IN ('admin','doctor'))

-- ===== expediente =====

CREATE POLICY "Paciente ve su propio expediente"
ON expediente FOR SELECT
USING (id_paciente = auth.uid());

CREATE POLICY "Admin y doctor ven cualquier expediente"
ON expediente FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Admin y doctor crean expediente"
ON expediente FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Admin y doctor actualizan expediente"
ON expediente FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Solo admin elimina expediente"
ON expediente FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id_profile = auth.uid() AND rol = 'admin')
);

-- ===== consultas =====

CREATE POLICY "Paciente ve sus propias consultas"
ON consultas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM citas
    WHERE citas.id_cita = consultas.id_cita
      AND citas.id_usuario = auth.uid()
  )
);

CREATE POLICY "Admin y doctor ven todas las consultas"
ON consultas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Admin y doctor crean consultas"
ON consultas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Admin y doctor actualizan consultas"
ON consultas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Solo admin elimina consultas"
ON consultas FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id_profile = auth.uid() AND rol = 'admin')
);

-- ===== detalle_consultas =====

CREATE POLICY "Paciente ve el detalle de sus propias consultas"
ON detalle_consultas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM consultas
    JOIN citas ON citas.id_cita = consultas.id_cita
    WHERE consultas.id_consulta = detalle_consultas.id_consulta
      AND citas.id_usuario = auth.uid()
  )
);

CREATE POLICY "Admin y doctor ven todo el detalle"
ON detalle_consultas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Admin y doctor crean detalle"
ON detalle_consultas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Admin y doctor actualizan detalle"
ON detalle_consultas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id_profile = auth.uid() AND rol IN ('admin', 'doctor')
  )
);

CREATE POLICY "Solo admin elimina detalle"
ON detalle_consultas FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id_profile = auth.uid() AND rol = 'admin')
);

-- ---------------------------------------------------------------------
-- 3. OPERACIÓN TRANSACCIONAL (RPC)
--    Inserta 1 fila en `consultas` y N filas en `detalle_consultas`
--    dentro de una sola transacción atómica. SECURITY INVOKER: respeta
--    las políticas RLS de arriba (no escala privilegios).
--
--    p_tratamientos: jsonb con forma
--    [{ "id_tratamiento": "uuid", "cantidad": 1, "notas": "texto" }, ...]
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.registrar_consulta(
  p_id_cita       UUID,
  p_id_odontologo UUID,
  p_diagnostico   TEXT,
  p_evolucion     TEXT,
  p_tratamientos  JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_id_consulta UUID;
  v_item JSONB;
BEGIN
  IF p_tratamientos IS NULL OR jsonb_array_length(p_tratamientos) = 0 THEN
    RAISE EXCEPTION 'Debe incluir al menos un tratamiento en la consulta';
  END IF;

  INSERT INTO consultas (id_cita, id_odontologo, diagnostico, evolucion)
  VALUES (p_id_cita, p_id_odontologo, p_diagnostico, p_evolucion)
  RETURNING id_consulta INTO v_id_consulta;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_tratamientos)
  LOOP
    INSERT INTO detalle_consultas (id_consulta, id_tratamiento, cantidad, notas)
    VALUES (
      v_id_consulta,
      (v_item->>'id_tratamiento')::UUID,
      COALESCE((v_item->>'cantidad')::INT, 1),
      v_item->>'notas'
    );
  END LOOP;

  -- Marca la cita como completada (estado 4, ver ESTADO_CITA en el frontend)
  UPDATE citas SET estado = 4 WHERE id_cita = p_id_cita;

  RETURN v_id_consulta;
END;
$$;
