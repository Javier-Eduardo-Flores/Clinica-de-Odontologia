// app/dashboard/citas/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { ArrowLeft, Calendar, Clock, Mail, Phone, IdCard } from "lucide-react";
import { cancelarCitaStaff } from "@/app/actions/citas";
import CompletarCitaForm from "@/app/components/citas/CompletarCitaForm";
import ExpedienteForm from "@/app/components/expediente/ExpedienteForm";
import { Odontograma } from "@/app/components/odontograma/Odontograma";
import { obtenerDientesConEstado } from "@/app/actions/obtener-dientes";
import ActualizarOdontogramaForm from "@/app/components/odontograma/ActualizarOdontogramaForm";

const ESTADO_LABEL: Record<number, string> = {
  1: "Pendiente",
  2: "Confirmada",
  3: "Cancelada",
  4: "Completada",
};

const ESTADO_BADGE: Record<number, string> = {
  1: "bg-amber-50 text-amber-700",
  2: "bg-green-50 text-green-700",
  3: "bg-red-50 text-red-700",
  4: "bg-blue-50 text-clinica-dark",
};

export default async function CitaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || !["admin", "doctor", "recepcionista"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  // Agregamos odontologos a la consulta para traer el nombre del doctor asignado
  const { data: cita } = await supabase
    .from("citas")
    .select(
      `id_cita, fecha_cita, motivo, estado, id_odontologo,
       pacientes!fk_id_usuario ( id_paciente, primer_nombre, primer_apellido, correo, telefono, dni, fecha_nacimiento ),
       odontologos ( primer_nombre, primer_apellido )`
    )
    .eq("id_cita", id)
    .maybeSingle();

  if (!cita) notFound();

  const paciente = Array.isArray(cita.pacientes) ? cita.pacientes[0] : cita.pacientes;
  const doctor = Array.isArray(cita.odontologos) ? cita.odontologos[0] : cita.odontologos;
  
  const esPendienteOConfirmada = cita.estado === 1 || cita.estado === 2;

  let medicamentosIniciales: string | null = null;
  let observacionesIniciales: string | null = null;
  let expedienteActualizadoEn: string | null = null;
  let dientes: Awaited<ReturnType<typeof obtenerDientesConEstado>> = [];
  let catalogoDientes: { id_diente: string; numero_fdi: number; nombre: string }[] = [];
  let catalogoEstados: { id_estado_diente: string; nombre: string; color: string | null }[] = [];

  if (paciente) {
    const { data: expediente } = await supabase
      .from("expediente")
      .select("medicamentos_actuales, observaciones, actualizado_en")
      .eq("id_paciente", paciente.id_paciente)
      .maybeSingle();

    medicamentosIniciales = expediente?.medicamentos_actuales ?? null;
    observacionesIniciales = expediente?.observaciones ?? null;
    expedienteActualizadoEn = expediente?.actualizado_en ?? null;

    dientes = await obtenerDientesConEstado(paciente.id_paciente);

    const { data: dientesData } = await supabase
      .from("diente")
      .select("id_diente, numero_fdi, nombre")
      .order("numero_fdi", { ascending: true });
    catalogoDientes = dientesData ?? [];

    const { data: estadosData } = await supabase
      .from("estado_diente")
      .select("id_estado_diente, nombre, color")
      .order("nombre", { ascending: true });
    catalogoEstados = estadosData ?? [];
  }

  const puedeCompletar = perfil.rol === "doctor" && esPendienteOConfirmada;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/citas" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/citas"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver a citas
          </Link>
        </header>

        <main className="p-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-sans font-bold text-gray-900">Detalle de la Cita</h1>
            <span className={"text-xs font-sans font-bold px-3 py-1 rounded-full " + (ESTADO_BADGE[cita.estado] ?? "bg-gray-100 text-gray-600")}>
              {ESTADO_LABEL[cita.estado] ?? cita.estado}
            </span>
          </div>

          {/* Datos de la cita */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-3">Motivo de la Cita</h2>
            <p className="font-sans text-gray-900 mb-4">{cita.motivo}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 font-sans">
              <span className="flex items-center gap-2">
                <Calendar size={15} />
                {new Date(cita.fecha_cita).toLocaleDateString("es-HN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={15} />
                {new Date(cita.fecha_cita).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* SECCIÓN AGREGADA: Muestra al doctor asignado */}
            {doctor && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600 font-sans">
                <span className="font-bold text-gray-900">Odontólogo asignado:</span>
                <span>Dr(a). {doctor.primer_nombre} {doctor.primer_apellido}</span>
              </div>
            )}
          </div>

          {/* Datos del paciente */}
          {paciente ? (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">Paciente</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-clinica-light flex items-center justify-center font-sans font-bold text-clinica-dark shrink-0">
                  {paciente.primer_nombre?.[0]}{paciente.primer_apellido?.[0]}
                </div>
                <p className="font-sans font-semibold text-gray-900">
                  {paciente.primer_nombre} {paciente.primer_apellido}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 font-sans">
                <span className="flex items-center gap-2"><IdCard size={14} /> {paciente.dni}</span>
                <span className="flex items-center gap-2"><Mail size={14} /> {paciente.correo}</span>
                <span className="flex items-center gap-2"><Phone size={14} /> {paciente.telefono}</span>
                <span className="flex items-center gap-2">
                  <Calendar size={14} />
                  {(() => { const [y, m, d] = paciente.fecha_nacimiento.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" }); })()}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-sans text-red-700">
                No se pudieron cargar los datos del paciente. Revisa que la política RLS
                &quot;Personal ve todos los pacientes&quot; esté aplicada en la tabla pacientes.
              </p>
            </div>
          )}

          {/* Expediente + Odontograma — editables aquí mismo, solo para doctor */}
          {paciente && esPendienteOConfirmada && perfil.rol === "doctor" && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
                  Expediente Clínico General
                </h2>
                <ExpedienteForm
                  idPaciente={paciente.id_paciente}
                  medicamentosIniciales={medicamentosIniciales}
                  observacionesIniciales={observacionesIniciales}
                  actualizadoEn={expedienteActualizadoEn}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">Odontograma</h2>
                <div className="mb-6">
                  <Odontograma dientes={dientes} />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-sans font-bold text-gray-900 mb-3">Registrar nuevo estado</h3>
                  <ActualizarOdontogramaForm
                    idPaciente={paciente.id_paciente}
                    dientes={catalogoDientes}
                    estados={catalogoEstados}
                  />
                </div>
              </div>
            </>
          )}

          {/* Acciones */}
          {esPendienteOConfirmada && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">Acciones</h2>

              {puedeCompletar ? (
                <div className="mb-6">
                  <p className="text-sm font-sans font-semibold text-gray-900 mb-3">
                    Completar cita con diagnóstico
                  </p>
                  <CompletarCitaForm idCita={cita.id_cita} />
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-sans mb-6">
                  Solo el odontólogo puede marcar esta cita como completada.
                </p>
              )}

              <div className="pt-4 border-t border-gray-100">
                <form action={cancelarCitaStaff}>
                  <input type="hidden" name="id_cita" value={cita.id_cita} />
                  <button
                    type="submit"
                    className="text-red-600 font-sans font-semibold text-sm px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Cancelar Cita
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}