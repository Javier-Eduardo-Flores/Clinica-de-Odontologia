import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import { Search, Bell } from "lucide-react";
import Link from "next/link";
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
    .select("id_factura, fecha, subtotal, impuestos, descuento, total, estado, pacientes(primer_nombre, primer_apellido)")
    .order("fecha", { ascending: false });

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

  const totalIngresos = facturas?.reduce((sum, f) => sum + Number(f.total), 0) ?? 0;
  const facturasPendientes = facturas?.filter((f) => f.estado === 1).length ?? 0;
  const facturasPagadas = facturas?.filter((f) => f.estado === 2).length ?? 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/facturacion" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar facturas..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </div>
          <Link href="/dashboard/notificaciones" className="relative p-2">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-sans font-semibold text-gray-900">{perfil.nombre} {perfil.apellido}</p>
              <p className="text-xs text-gray-400 capitalize">{perfil.rol}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>
        </header>

        <main className="p-8">
          <FacturaList
            facturas={facturas ?? []}
            pacientes={pacientes ?? []}
            tratamientos={tratamientos ?? []}
            productos={productos ?? []}
            descuentos={descuentos ?? []}
            totalIngresos={totalIngresos}
            facturasPendientes={facturasPendientes}
            facturasPagadas={facturasPagadas}
            dbErrors={{
              pacientes: errPacientes?.message,
              tratamientos: errTratamientos?.message,
              productos: errProductos?.message,
              descuentos: errDescuentos?.message,
            }}
          />
        </main>
      </div>
    </div>
  );
}
