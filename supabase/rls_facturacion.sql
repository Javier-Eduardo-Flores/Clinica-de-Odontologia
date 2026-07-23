-- POLÍTICAS RLS PARA MÓDULO DE FACTURACIÓN
-- Ejecutar en el SQL Editor de Supabase

-- PACIENTES
DROP POLICY IF EXISTS "Pacientes SELECT" ON public.pacientes;
CREATE POLICY "Pacientes SELECT" ON public.pacientes
  FOR SELECT TO authenticated USING (true);

-- FACTURA
DROP POLICY IF EXISTS "Factura SELECT" ON public.factura;
DROP POLICY IF EXISTS "Factura INSERT" ON public.factura;
DROP POLICY IF EXISTS "Factura UPDATE" ON public.factura;
DROP POLICY IF EXISTS "Factura DELETE" ON public.factura;

CREATE POLICY "Factura SELECT" ON public.factura
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Factura INSERT" ON public.factura
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Factura UPDATE" ON public.factura
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Factura DELETE" ON public.factura
  FOR DELETE TO authenticated USING (true);

-- DETALLE FACTURA
DROP POLICY IF EXISTS "DetalleFactura SELECT" ON public.detalle_factura;
DROP POLICY IF EXISTS "DetalleFactura INSERT" ON public.detalle_factura;
DROP POLICY IF EXISTS "DetalleFactura DELETE" ON public.detalle_factura;

CREATE POLICY "DetalleFactura SELECT" ON public.detalle_factura
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "DetalleFactura INSERT" ON public.detalle_factura
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "DetalleFactura DELETE" ON public.detalle_factura
  FOR DELETE TO authenticated USING (true);

-- TRATAMIENTO
DROP POLICY IF EXISTS "Tratamiento SELECT" ON public.tratamiento;
CREATE POLICY "Tratamiento SELECT" ON public.tratamiento
  FOR SELECT TO authenticated USING (true);

-- PRODUCTO
DROP POLICY IF EXISTS "Producto SELECT" ON public.producto;
CREATE POLICY "Producto SELECT" ON public.producto
  FOR SELECT TO authenticated USING (true);

-- DESCUENTO
DROP POLICY IF EXISTS "Descuento SELECT" ON public.descuento;
CREATE POLICY "Descuento SELECT" ON public.descuento
  FOR SELECT TO authenticated USING (true);
