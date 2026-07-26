import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import StatCard from "@/app/components/statcard";
import TratamientoForm from "@/app/components/tratamientoform";
import {
  User,
  CalendarCheck,
  DollarSign,
  Bell,
  Search,
  Stethoscope,
  Clock,
  Calendar,
  Eye,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Wallet,
  CalendarPlus,
  Smile,
  LogOut,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";
import { confirmarCitaStaff } from "@/app/actions/citas";
import { obtenerDientesConEstado } from "@/app/actions/obtener-dientes";
import { Odontograma } from "@/app/components/odontograma/Odontograma";


const ESTADO_CITA = {
  PENDIENTE: 1,
  CONFIRMADA: 2,
  CANCELADA: 3,
  COMPLETADA: 4,
} as const;

const ESTADO_LABEL: Record<number, string> = {
  [ESTADO_CITA.PENDIENTE]: "Pendiente",
  [ESTADO_CITA.CONFIRMADA]: "Confirmada",
  [ESTADO_CITA.CANCELADA]: "Cancelada",
  [ESTADO_CITA.COMPLETADA]: "Completada",
};


export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, apellido, rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil) {
    redirect("/login");
  }

  if (perfil.rol === "paciente") {
    return <DashboardPaciente supabase={supabase} userId={user.id} perfil={perfil} />;
  }

  // admin, doctor y recepcionista comparten el dashboard operativo/odontólogo
  return <DashboardOdontologo supabase={supabase} perfil={perfil} />;
}

/* ==================================================================
   DASHBOARD — ODONTÓLOGO
================================================================== */
async function DashboardOdontologo({
  supabase,
  perfil,
}: {
  supabase: SupabaseClient;
  perfil: { nombre: string; apellido: string; rol: string };
}) {
  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  // TOTAL DE PACIENTES
  const { count: totalPacientes } = await supabase
    .from("pacientes")
    .select("*", { count: "exact", head: true });

  // CITAS DE HOY
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

  // INGRESOS MENSUALES
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

  // PERSONAL
  const { data: personal } = await supabase
    .from("profiles")
    .select("nombre, apellido, rol")
    .limit(3);

  // PACIENTES RECIENTES
  const { data: facturasRecientes } = await supabase
    .from("factura")
    .select("id_factura, fecha, total, estado, pacientes(primer_nombre, primer_apellido)")
    .order("fecha", { ascending: false })
    .limit(4);

  // CITAS PENDIENTES DE CONFIRMAR
  const { data: citasPendientes } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, pacientes(primer_nombre, primer_apellido)")
    .eq("estado", 1)
    .order("fecha_cita", { ascending: true })
    .limit(5);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <form action="/dashboard/pacientes" method="GET" className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Buscar pacientes, registros o personal..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </form>
          <Link
            href="/dashboard/pacientes/nuevo"
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
              value={`L. ${ingresosMensuales.toLocaleString("es")}`}
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
                      <td className="py-4 font-sans font-semibold text-gray-900">L. {Number(t.precio).toLocaleString("es")}</td>
                      <td className="py-4">
                        <TratamientoForm mode="editar" tratamiento={t} >
                        </TratamientoForm>
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

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-sans font-bold text-gray-900">Citas Pendientes de Confirmar</h2>
            </div>

            {!citasPendientes || citasPendientes.length === 0 ? (
              <p className="text-sm text-gray-400 font-sans">No hay citas pendientes por confirmar.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {citasPendientes.map((c) => (
                  <div
                    key={c.id_cita}
                    className="flex items-center justify-between border border-gray-100 rounded-lg p-4"
                  >
                    <div>
                      <p className="font-sans font-semibold text-gray-900 text-sm">
                        {c.pacientes?.[0]?.primer_nombre} {c.pacientes?.[0]?.primer_apellido}
                      </p>
                      <p className="text-xs text-gray-500 font-sans mt-0.5">{c.motivo}</p>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">
                        {new Date(c.fecha_cita).toLocaleString("es-HN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/citas/${c.id_cita}/editar`}
                        className="text-gray-700 font-sans font-semibold text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Modificar
                      </Link>
                      <form action={confirmarCitaStaff}>
                        <input type="hidden" name="id_cita" value={c.id_cita} />
                        <button
                          type="submit"
                          className="bg-clinica-dark text-white font-sans font-semibold text-sm px-4 py-2 rounded-lg hover:bg-clinica-medium transition-colors"
                        >
                          Confirmar
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        Factura por L. {Number(f.total).toLocaleString("es")}
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

/* ==================================================================
   DASHBOARD — PACIENTE / CLIENTE
================================================================== */
async function DashboardPaciente({
  supabase,
  userId,
  perfil,
}: {
  supabase: SupabaseClient;
  userId: string;
  perfil: { nombre: string; apellido: string; rol: string };
}) {
  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  // Datos del registro de paciente (dni, expediente, etc.)
  const { data: pacienteRow } = await supabase
    .from("pacientes")
    .select("id_paciente, dni")
    .eq("id_paciente", userId)
    .maybeSingle();

  const numeroExpediente = pacienteRow?.id_paciente
    ? pacienteRow.id_paciente.slice(0, 8).toUpperCase()
    : "—";

  // PRÓXIMAS CITAS del paciente
  const { data: citas } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, estado, fecha_proxima_cita")
    .eq("id_usuario", userId)
    .gte("fecha_cita", new Date().toISOString())
    .neq("estado", ESTADO_CITA.CANCELADA)
    .order("fecha_cita", { ascending: true })
    .limit(5);

  const proximaLimpieza =
    citas?.find((c) => c.fecha_proxima_cita)?.fecha_proxima_cita ?? null;

  // HISTORIAL DE TRATAMIENTOS (consultas ya realizadas)
  const { data: consultasData } = await supabase
    .from("consultas")
    .select(
      `id_consulta,
       fecha,
       diagnostico,
       citas!inner ( id_usuario ),
       odontologos ( primer_nombre, primer_apellido ),
       detalle_consultas ( tratamiento ( nombre ) )`
    )
    .eq("citas.id_usuario", userId)
    .order("fecha", { ascending: false })
    .limit(10);

  type ConsultaFila = {
    id_consulta: string;
    fecha: string;
    diagnostico: string | null;
    odontologos: { primer_nombre: string; primer_apellido: string } | null;
    detalle_consultas: { tratamiento: { nombre: string } | null }[] | null;
  };

  const historial = ((consultasData ?? []) as unknown as ConsultaFila[]).map((c) => ({
    id_consulta: c.id_consulta,
    fecha: c.fecha,
    diagnostico: c.diagnostico,
    doctor: c.odontologos
      ? `Dr(a). ${c.odontologos.primer_nombre} ${c.odontologos.primer_apellido}`
      : "Sin asignar",
    tratamientos: (c.detalle_consultas ?? [])
      .map((d) => d.tratamiento?.nombre)
      .filter(Boolean)
      .join(", "),
  }));

  const tratamientosCompletados = historial.length;

  // ODONTOGRAMA — dientes del paciente con su estado más reciente
  const dientes = await obtenerDientesConEstado(userId);

  // SALDO PENDIENTE: total facturado - total pagado
  const { data: facturasData } = await supabase
    .from("factura")
    .select("id_factura, total, pagos ( monto )")
    .eq("id_paciente", userId);

  type FacturaFila = { total: number; pagos: { monto: number }[] | null };
  const saldoPendiente = ((facturasData ?? []) as unknown as FacturaFila[]).reduce(
    (acc, f) => {
      const pagado = (f.pagos ?? []).reduce((s, p) => s + Number(p.monto), 0);
      return acc + (Number(f.total) - pagado);
    },
    0
  );

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-HN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });
  const formatLempiras = (n: number) =>
    `L. ${n.toLocaleString("es-HN", { minimumFractionDigits: 2 })}`;

  const estadoBadge = (estado: number) => {
    switch (estado) {
      case ESTADO_CITA.CONFIRMADA:
        return { label: "Confirmada", classes: "bg-green-50 text-green-700" };
      case ESTADO_CITA.COMPLETADA:
        return { label: "Completada", classes: "bg-blue-50 text-clinica-dark" };
      default:
        return { label: "Pendiente", classes: "bg-amber-50 text-amber-700" };
    }
  };

  // Porcentaje del anillo de estado dental — simple heurística visual
  // basada en si hay pagos pendientes y tratamientos recientes.
  const pctAnillo = saldoPendiente > 0 ? 62 : tratamientosCompletados > 0 ? 92 : 40;
  const estadoDentalLabel = saldoPendiente > 0 ? "Requiere atención" : "Óptimo";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tratamientos o citas..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </div>
          <Link href="/dashboard/notificaciones" className="relative p-2">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-sans font-semibold text-gray-900">{nombreCompleto}</p>
              <p className="text-xs text-gray-400">Expediente #{numeroExpediente}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>

          <form action={signOut}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-2 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </form>
        </header>

        <main className="p-8">
          {/* HERO de bienvenida — elemento distintivo del portal de paciente */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 relative overflow-hidden rounded-xl bg-clinica-dark px-8 py-9 flex flex-col justify-center">
              <svg
                className="absolute -right-6 -bottom-8 opacity-10"
                width="220"
                height="220"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2C8 2 5 4.5 5 8.2c0 2.6.9 3.6 1.3 6.4.3 2.1.6 5.4 2.3 5.4 1.9 0 1.6-4.2 3.4-4.2s1.5 4.2 3.4 4.2c1.7 0 2-3.3 2.3-5.4.4-2.8 1.3-3.8 1.3-6.4C19 4.5 16 2 12 2Z"
                  fill="white"
                />
              </svg>
              <h1 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">
                Bienvenido de nuevo, {nombreCompleto.split(" ")[0]}
              </h1>
              <p className="text-sm text-blue-100 font-sans max-w-md mb-5">
                Gestiona tu salud dental de forma sencilla. Revisa tus próximos pasos y mantén tu sonrisa brillante.
              </p>
              <Link
                href="/dashboard/citas/nueva"
                className="inline-flex items-center gap-2 w-fit bg-white text-clinica-dark font-sans font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CalendarPlus size={16} />
                Agendar Nueva Cita
              </Link>
            </div>

            {/* Estado dental + tratamientos completados */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs text-gray-400 font-sans">Tratamientos completados</p>
                  <p className="text-3xl font-sans font-bold text-gray-900 mt-1">{tratamientosCompletados}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Stethoscope size={18} className="text-clinica-dark" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs text-gray-400 font-sans">Siguiente limpieza</p>
                  <p className="text-sm font-sans font-semibold text-gray-900 mt-1">
                    {proximaLimpieza ? formatFecha(proximaLimpieza) : "Sin programar"}
                  </p>
                  <p className="text-xs font-sans text-clinica-dark mt-0.5">Estado: {estadoDentalLabel}</p>
                </div>
                {/* Anillo de estado dental */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `conic-gradient(#123F63 ${pctAnillo * 3.6}deg, #E5EBF1 0deg)`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                    <Smile size={16} className="text-clinica-dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Próximas citas — tarjetas con acciones, no tabla */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-clinica-dark" />
                <h2 className="text-xl font-sans font-bold text-gray-900">Próximas Citas</h2>
              </div>

              {!citas || citas.length === 0 ? (
                <p className="text-sm text-gray-400 font-sans">No tienes citas próximas agendadas.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {citas.map((c) => {
                    const badge = estadoBadge(c.estado);
                    return (
                      <div
                        key={c.id_cita}
                        className="border border-gray-100 rounded-lg p-4 border-l-4 border-l-clinica-dark"
                      >
                        <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full inline-block mb-2 ${badge.classes}`}>
                          {badge.label}
                        </span>
                        <p className="font-sans font-semibold text-gray-900 text-sm mb-2">{c.motivo}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-1">
                          <Calendar size={12} /> {formatFecha(c.fecha_cita)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-3">
                          <Clock size={12} /> {formatHora(c.fecha_cita)}
                        </div>

                        {c.estado === ESTADO_CITA.PENDIENTE && (
                          <Link
                            href={`/dashboard/citas/${c.id_cita}/editar`}
                            className="block text-center text-xs font-sans font-semibold py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Modificar
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Historial de tratamientos */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-sans font-bold text-gray-900">Historial de Tratamientos</h2>
                <Link href="#odontograma" className="text-sm font-sans font-semibold text-clinica-dark hover:underline flex items-center gap-1">
                  Ver odontograma completo <ChevronRight size={14} />
                </Link>
              </div>

              {historial.length === 0 ? (
                <p className="text-sm text-gray-400 font-sans">Todavía no tienes tratamientos registrados.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                      <th className="py-3">Fecha</th>
                      <th className="py-3">Tratamiento</th>
                      <th className="py-3">Doctor</th>
                      <th className="py-3">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h) => (
                      <tr key={h.id_consulta} className="border-b border-gray-50 last:border-0">
                        <td className="py-4 text-gray-600 font-sans text-sm whitespace-nowrap">
                          {new Date(h.fecha).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-4 font-sans font-semibold text-gray-900">
                          {h.tratamientos || "Consulta general"}
                        </td>
                        <td className="py-4 text-gray-600 font-sans text-sm">{h.doctor}</td>
                        <td className="py-4">
                          <span title={h.diagnostico ?? "Sin diagnóstico registrado"} className="text-gray-400 inline-block">
                            <Eye size={16} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Odontograma */}
          <div id="odontograma" className="bg-white rounded-xl shadow-sm p-6 mb-8 scroll-mt-8">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-1">Mi Odontograma</h2>
            <p className="text-sm text-gray-400 font-sans mb-4">
              Estado más reciente registrado por tu odontólogo en cada diente.
            </p>
            <Odontograma dientes={dientes} />
          </div>

          {/* Tarjetas informativas — identidad propia del portal */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Lightbulb size={17} className="text-clinica-dark" />
              </div>
              <p className="font-sans font-semibold text-gray-900 text-sm mb-1">Consejo de Salud</p>
              <p className="text-xs text-gray-500 font-sans">
                Usa hilo dental a diario para prevenir la acumulación de placa en zonas difíciles.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <Wallet size={17} className="text-red-500" />
              </div>
              <p className="font-sans font-semibold text-gray-900 text-sm mb-1">Pagos Pendientes</p>
              <p className="text-xs text-gray-500 font-sans">
                {saldoPendiente > 0
                  ? `Tienes un saldo pendiente de ${formatLempiras(saldoPendiente)}.`
                  : "No tienes pagos pendientes."}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                <Sparkles size={17} className="text-purple-500" />
              </div>
              <p className="font-sans font-semibold text-gray-900 text-sm mb-1">Novedades</p>
              <p className="text-xs text-gray-500 font-sans">
                ¡Nuevo tratamiento de blanqueamiento láser disponible! Pregunta en tu próxima cita.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}