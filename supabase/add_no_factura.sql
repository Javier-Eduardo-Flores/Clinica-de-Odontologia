-- Agregar columna no_factura a la tabla factura
ALTER TABLE public.factura ADD COLUMN no_factura VARCHAR(50);

-- Backfill registros existentes con el mismo formato que usa la UI
UPDATE public.factura 
SET no_factura = CONCAT(
  'FAC-', 
  TO_CHAR(fecha, 'YYYYMM'), 
  '-', 
  UPPER(LEFT(id_factura::text, 8))
)
WHERE no_factura IS NULL;
