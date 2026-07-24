-- Agregar tipo de documento (01=Factura, 02=Recibo Honorarios)
ALTER TABLE public.factura ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(2) DEFAULT '01' NOT NULL;

-- Arreglar política RLS de pacientes (la vieja usaba auth_rol() que no existe)
DROP POLICY IF EXISTS "pacientes_select" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes SELECT" ON public.pacientes;
CREATE POLICY "Pacientes SELECT" ON public.pacientes
  FOR SELECT TO authenticated USING (true);
