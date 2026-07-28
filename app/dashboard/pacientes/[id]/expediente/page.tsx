// app/dashboard/pacientes/[id]/expediente/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { ArrowLeft, Smile, Calendar, Clock } from "lucide-react";
import ExpedienteForm from "@/app/components/expediente/ExpedienteForm";
import AlertaMedicaBanner from "@/app/components/expediente/AlertaMedicaBanner";
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

export default async function ExpedientePacientePage({
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

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id_paciente, primer_nombre, primer_apellido, correo, telefono, fecha_nacimiento, dni")
    .eq("id_paciente", id)
    .maybeSingle();

  if (!paciente) notFound();

  // TODO el historial de citas del paciente (cualquier estado)
  const { data: citas } = await supabase
    .from("citas")
    .select(
      `id_cita, fecha_cita, motivo, estado,
       consultas ( id_consulta, diagnostico, observaciones, odontologos ( primer_nombre, primer_apellido ),
         detalle_consultas ( tratamiento ( nombre ) ) )`
    )
    .eq("id_usuario", id)
    .order("fecha_cita", { ascending: false });

  // Datos generales del expediente clínico (si existe fila)
  const { data: expediente } = await supabase
    .from("expediente")
    .select("medicamentos_actuales, observaciones, actualizado_en")
    .eq("id_paciente", id)
    .maybeSingle();

  // ODONTOGRAMA — estado actual + catálogos para el formulario de edición
  const dientes = await obtenerDientesConEstado(id);

  const { data: catalogoDientes } = await supabase
    .from("diente")
    .select("id_diente, numero_fdi, nombre")
    .order("numero_fdi", { ascending: true });

  const { data: catalogoEstados } = await supabase
    .from("estado_diente")
    .select("id_estado_diente, nombre, color")
    .order("nombre", { ascending: true });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/pacientes" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/pacientes"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver a pacientes
          </Link>
        </header>

        <main className="p-8 max-w-5xl">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-sans font-bold text-gray-900">
              Expediente — {paciente.primer_nombre} {paciente.primer_apellido}
            </h1>
            <Link
              href="#odontograma"
              className="flex items-center gap-1.5 bg-clinica-dark text-white font-sans font-semibold text-sm px-4 py-2 rounded-lg hover:bg-clinica-medium transition-colors"
            >
              <Smile size={16} />
              Ir al Odontograma
            </Link>
          </div>
          <p className="text-gray-500 font-sans mb-6">
            DNI: {paciente.dni} · {paciente.correo} · {paciente.telefono}
          </p>

          <AlertaMedicaBanner
            medicamentos={expediente?.medicamentos_actuales ?? null}
            observaciones={expediente?.observaciones ?? null}
          />

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">
              Expediente Clínico General
            </h2>
            <ExpedienteForm
              idPaciente={paciente.id_paciente}
              medicamentosIniciales={expediente?.medicamentos_actuales ?? null}
              observacionesIniciales={expediente?.observaciones ?? null}
              actualizadoEn={expediente?.actualizado_en ?? null}
            />
          </div>

          <div id="odontograma" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-8">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">Odontograma</h2>
            <div className="mb-6">
              <Odontograma dientes={dientes} />
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-sans font-bold text-gray-900 mb-3">Registrar nuevo estado</h3>
              <ActualizarOdontogramaForm
                idPaciente={paciente.id_paciente}
                dientes={catalogoDientes ?? []}
                estados={catalogoEstados ?? []}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">Historial de Citas</h2>

            {!citas || citas.length === 0 ? (
              <p className="text-gray-400 font-sans text-sm">Este paciente no tiene citas registradas.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {citas.map((c) => {
                  const consulta = c.consultas?.[0];
                  const tratamientos = (consulta?.detalle_consultas ?? [])
                    .map((d: any) => d.tratamiento?.nombre)
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <div key={c.id_cita} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-sans">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {new Date(c.fecha_cita).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {new Date(c.fecha_cita).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <span className={"text-[10px] font-sans font-bold px-2 py-0.5 rounded-full " + (ESTADO_BADGE[c.estado] ?? "bg-gray-100 text-gray-600")}>
                          {ESTADO_LABEL[c.estado] ?? c.estado}
                        </span>
                      </div>
                      <p className="font-sans font-semibold text-gray-900 text-sm">{c.motivo}</p>

                      {consulta && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400 font-sans mb-1">
                            Atendido por Dr(a). {consulta.odontologos?.[0]?.primer_nombre} {consulta.odontologos?.[0]?.primer_apellido}
                          </p>
                          {consulta.diagnostico && (
                            <p className="text-sm text-gray-600 font-sans">
                              <span className="font-semibold">Diagnóstico:</span> {consulta.diagnostico}
                            </p>
                          )}
                          {tratamientos && (
                            <p className="text-sm text-gray-600 font-sans mt-1">
                              <span className="font-semibold">Tratamientos:</span> {tratamientos}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}