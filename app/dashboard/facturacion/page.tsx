import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import { Suspense } from "react";
import FacturaList from "./factura-list";

export default async function FacturacionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, apellido, rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil) redirect("/login");

  const { data: facturas, error: errFacturas } = await supabase
    .from("factura")
    .select("id_factura, id_paciente, no_factura, tipo_documento, fecha, subtotal, impuestos, descuento, total, estado")
    .order("fecha", { ascending: false });

  const idsFacturas = (facturas ?? []).map((f) => f.id_factura);
  const { data: detalles } = idsFacturas.length > 0 ? await supabase
    .from("detalle_factura")
    .select("id_factura, cantidad, precio_unitario, monto_descuento, tratamiento(nombre), producto(nombre), descuento(nombre)")
    .in("id_factura", idsFacturas) : { data: [] };

  const detallesPorFactura: Record<string, any[]> = {};
  detalles?.forEach((d) => {
    if (!detallesPorFactura[d.id_factura]) detallesPorFactura[d.id_factura] = [];
    detallesPorFactura[d.id_factura].push(d);
  });

  const { data: pacientes, error: errPacientes } = await supabase
    .from("pacientes")
    .select("id_paciente, primer_nombre, primer_apellido")
    .order("primer_nombre");

  const { data: tratamientos, error: errTratamientos } = await supabase
    .from("tratamiento")
    .select("id_tratamiento, nombre, precio")
    .order("nombre");

  const { data: productos, error: errProductos } = await supabase
    .from("producto")
    .select("id_producto, nombre, precio")
    .eq("estado", 1)
    .order("nombre");

  const { data: descuentos, error: errDescuentos } = await supabase
    .from("descuento")
    .select("id_descuento, nombre, tipo, valor")
    .eq("activo", true)
    .order("nombre");

  const { data: metodosPago, error: errMetodosPago } = await supabase
    .from("metodo_pago")
    .select("id_metodo_pago, nombre")
    .eq("activo", true)
    .order("nombre");

  const { data: pagos } = await supabase
    .from("pagos")
    .select("id_factura, monto");

  const pagosPorFactura: Record<string, number> = {};
  pagos?.forEach((p) => {
    pagosPorFactura[p.id_factura] = (pagosPorFactura[p.id_factura] || 0) + Number(p.monto);
  });

  const totalIngresos = facturas?.reduce((sum, f) => sum + Number(f.total), 0) ?? 0;
  const facturasPendientes = facturas?.filter((f) => f.estado === 1).length ?? 0;
  const facturasPagadas = facturas?.filter((f) => f.estado === 2).length ?? 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/facturacion" />

      <div className="flex-1">
        <main className="p-8">
          <Suspense fallback={null}>
            <FacturaList
              perfil={perfil}
              facturas={facturas ?? []}
              pacientes={pacientes ?? []}
              tratamientos={tratamientos ?? []}
              productos={productos ?? []}
              descuentos={descuentos ?? []}
              metodosPago={metodosPago ?? []}
              pagosPorFactura={pagosPorFactura}
              detallesPorFactura={detallesPorFactura}
              totalIngresos={totalIngresos}
              facturasPendientes={facturasPendientes}
              facturasPagadas={facturasPagadas}
              dbErrors={{
                pacientes: errPacientes?.message,
                tratamientos: errTratamientos?.message,
                productos: errProductos?.message,
                descuentos: errDescuentos?.message,
                metodosPago: errMetodosPago?.message,
              }}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}