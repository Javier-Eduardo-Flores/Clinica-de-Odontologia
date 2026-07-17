import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import StatCard from "@/app/components/statcard";
import { User, CalendarCheck, DollarSign, Bell, Pencil, Search } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, apellido, rol")
    .eq("id_profile", user?.id)
    .maybeSingle();

    const nombreCompleto = perfil ? `${perfil.nombre} ${perfil.apellido}` : "Usuario";

//TOTAL DE PACIENTES
    const { count: totalPacientes } = await supabase
    .from("pacientes")
    .select("*", { count: "exact", head: true });

//CITAS DE HOY
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const { count: citasHoy } = await supabase
    .from("citas")
    .select("*", { count: "exact", head: true })
    .gte("fecha_cita", hoyInicio.toISOString())
    .lte("fecha_cita", hoyFin.toISOString());

    const { data: proximaCita } = await supabase
    .from("citas")
    .select("fecha_cita, motivo, profiles(nombre, apellido)")
    .gte("fecha_cita", new Date().toISOString())
    .order("fecha_cita", { ascending: true })
    .limit(1)
    .maybeSingle();

//INGRESOS MENSUALES
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);
    primerDiaMes.setHours(0, 0, 0, 0);

    const { data: facturasDelMes } = await supabase
    .from("factura")
    .select("total")
    .gte("fecha", primerDiaMes.toISOString().slice(0, 10));

    const ingresosMensuales =
    facturasDelMes?.reduce((suma, f) => suma + Number(f.total), 0) ?? 0;

    const { data: tratamientos } = await supabase
    .from("tratamiento")
    .select("id_tratamiento, nombre, descripcion, precio")
    .limit(4);

//PERSONAL
    const { data: personal } = await supabase
    .from("profiles")
    .select("nombre, apellido, rol")
    .limit(3);

//PACIENTES RECIENTES
    const { data: facturasRecientes } = await supabase
    .from("factura")
    .select("id_factura, fecha, total, estado, pacientes(primer_nombre, primer_apellido)")
    .order("fecha", { ascending: false })
    .limit(4);

return (
    <div className="flex min-h-screen bg-gray-50">
        <Sidebar activePath="/dashboard" />

        <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
                type="text"
                placeholder="Buscar pacientes, registros o personal..."
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
        </div>
            <Link href="/dashboard/pacientes/nuevo"
            className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2 rounded-lg hover:bg-clinica-medium"
            >
                + Nuevo Paciente
            </Link>
        <Link href="/dashboard/notificaciones" className="relative p-2">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          <Link href="/dashboard/perfil" className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-sans font-semibold text-gray-900">{nombreCompleto}</p>
              <p className="text-xs text-gray-400 capitalize">{perfil?.rol}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </Link>
        </header>

        <main className="p-8">
          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-1">
            Buenos Días, {nombreCompleto}
          </h1>
          <p className="text-gray-500 font-sans mb-6">Aquí tiene un resumen de la actividad de la Clínica para hoy.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={User} iconColor="text-clinica-dark" iconBg="bg-blue-50" borderColor="border-clinica-dark"
              badge="" badgeColor=""
              value={String(totalPacientes ?? 0)}
              label="Total de pacientes registrados"
            />
            <StatCard
              icon={CalendarCheck} iconColor="text-clinica-dark" iconBg="bg-blue-50" borderColor="border-clinica-dark"
              badge="" badgeColor=""
              value={String(citasHoy ?? 0)}
              label={
                proximaCita
                  ? `Próxima: ${proximaCita.profiles[0]?.nombre ?? ""} ${proximaCita.profiles[0]?.apellido ?? ""} a las ${new Date(proximaCita.fecha_cita).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`
                  : "Sin próximas citas"
              }
            />
            <StatCard
              icon={DollarSign} iconColor="text-clinica-dark" iconBg="bg-blue-50" borderColor="border-clinica-dark"
              badge="" badgeColor=""
              value={`$${ingresosMensuales.toLocaleString("es")}`}
              label="Ingresos del mes actual"
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-sans font-bold text-gray-900">Gestión de Tratamientos</h2>
                <Link href="/dashboard/tratamientos" className="text-sm font-sans font-semibold text-clinica-dark hover:underline">
                  Ver todos
                </Link>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-3">Nombre</th>
                    <th className="py-3">Descripción</th>
                    <th className="py-3">Precio</th>
                    <th className="py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tratamientos?.map((t) => (
                    <tr key={t.id_tratamiento} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 font-sans font-semibold text-gray-900">{t.nombre}</td>
                      <td className="py-4 text-gray-600 font-sans text-sm max-w-xs truncate">{t.descripcion}</td>
                      <td className="py-4 font-sans font-semibold text-gray-900">${Number(t.precio).toLocaleString("es")}</td>
                      <td className="py-4">
                        <Link href={`/dashboard/tratamientos/${t.id_tratamiento}/editar`} className="text-gray-400 hover:text-clinica-dark">
                          <Pencil size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">Registro de Personal</h2>
              <div className="flex flex-col gap-4">
                {personal?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1">
                      <p className="font-sans font-semibold text-gray-900 text-sm">
                        {p.nombre} {p.apellido}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{p.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/personal"
                className="w-full mt-4 border border-dashed border-gray-300 rounded-lg py-2 text-sm font-sans font-semibold text-gray-500 hover:bg-gray-50 text-center block"
              >
                Gestionar Todo el Personal
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-sans font-bold text-gray-900">Pacientes Recientes</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facturasRecientes?.map((f) => (
                <Link
                  key={f.id_factura}
                  href={`/dashboard/facturas/${f.id_factura}`}
                  className="border border-gray-100 rounded-lg p-4 hover:border-clinica-dark transition-colors"
                >
                  <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-clinica-light flex items-center justify-center font-sans font-bold text-clinica-dark text-sm shrink-0">
                      {f.pacientes?.[0]?.primer_nombre?.[0]}{f.pacientes?.[0]?.primer_apellido?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-sans font-semibold text-gray-900 text-sm">
                          {f.pacientes?.[0]?.primer_nombre} {f.pacientes?.[0]?.primer_apellido}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(f.fecha).toLocaleDateString("es")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Factura por ${Number(f.total).toLocaleString("es")}
                      </p>
                      <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mt-2 inline-block">
                        Estado: {f.estado}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}