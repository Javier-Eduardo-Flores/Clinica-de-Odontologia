// app/dashboard/pacientes/[id]/expediente/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { ArrowLeft, Smile, Calendar, Clock, Stethoscope } from "lucide-react";
import { OdontogramaPaciente } from "@/app/components/odontograma/OdontogramaPaciente";
import { obtenerDientesConEstado } from "@/app/actions/obtener-dientes";

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

  // 1. Historial de citas del paciente
  const { data: citas } = await supabase
    .from("citas")
    .select(
      `id_cita, fecha_cita, motivo, estado,
       consultas ( 
          id_consulta, 
          diagnostico, 
          observaciones, 
          odontologos ( primer_nombre, primer_apellido ),
          detalle_consultas ( tratamiento ( nombre ) ) 
       )`
    )
    .eq("id_usuario", id)
    .order("fecha_cita", { ascending: false });

  // 2. Obtener la ÚLTIMA CONSULTA realizada por el doctor para este paciente
  const { data: ultimaConsulta } = await supabase
    .from("consultas")
    .select(
      `id_consulta, diagnostico, observaciones, creado_en,
       odontologos ( primer_nombre, primer_apellido ),
       detalle_consultas ( tratamiento ( nombre ) )`
    )
    .eq("id_paciente", id)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Datos generales del expediente clínico
  const { data: expediente } = await supabase
    .from("expediente")
    .select("medicamentos_actuales, observaciones, actualizado_en")
    .eq("id_paciente", id)
    .maybeSingle();

  // 4. ODONTOGRAMA — estado actual (piezas dentales)
  const dientes = await obtenerDientesConEstado(id);

  // Normalización de datos del doctor
  const medicoUltima = Array.isArray(ultimaConsulta?.odontologos)
    ? ultimaConsulta?.odontologos[0]
    : ultimaConsulta?.odontologos;

  const tratamientosUltima = (ultimaConsulta?.detalle_consultas ?? [])
    .map((d: any) => (Array.isArray(d.tratamiento) ? d.tratamiento[0]?.nombre : d.tratamiento?.nombre))
    .filter(Boolean)
    .join(", ");

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

          {/* Expediente Clínico General (Amarrado a la consulta de la cita si existe) */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
            <div>
              <h2 className="text-xl font-sans font-bold text-gray-900">
                Expediente Clínico General
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Última actualización:{" "}
                {ultimaConsulta?.creado_en
                  ? new Date(ultimaConsulta.creado_en).toLocaleString("es-HN")
                  : expediente?.actualizado_en
                  ? new Date(expediente.actualizado_en).toLocaleString("es-HN")
                  : "Sin registros"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-gray-400 uppercase tracking-wider mb-2">
                Medicamentos actuales (opcional)
              </label>
              <input
                type="text"
                readOnly
                value={expediente?.medicamentos_actuales || "No consume medicamentos actualmente."}
                className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 text-sm focus:outline-none cursor-default"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-gray-400 uppercase tracking-wider mb-2">
                Observaciones generales *
              </label>
              <textarea
                rows={3}
                readOnly
                value={
                  ultimaConsulta?.observaciones ||
                  expediente?.observaciones ||
                  "Sin observaciones registradas."
                }
                className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 text-sm focus:outline-none resize-none cursor-default"
              />
            </div>
          </div>

          {/* Odontograma */}
          <div id="odontograma" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-8">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">Odontograma</h2>
            <div>
              <OdontogramaPaciente dientes={dientes} />
            </div>
          </div>

          {/* Detalle de la última consulta realizada en la cita */}
          {ultimaConsulta && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-sans font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope size={20} className="text-clinica-dark" />
                Última Consulta Médica
              </h2>

              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/30 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-sans text-gray-500 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(ultimaConsulta.creado_en).toLocaleDateString("es-HN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {medicoUltima && (
                    <span className="text-xs font-sans font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      Dr(a). {medicoUltima.primer_nombre} {medicoUltima.primer_apellido}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Diagnóstico
                  </span>
                  <p className="text-sm font-sans text-gray-800">
                    {ultimaConsulta.diagnostico || "Sin diagnóstico registrado."}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Observaciones
                  </span>
                  <p className="text-sm font-sans text-gray-600">
                    {ultimaConsulta.observaciones || "Sin observaciones."}
                  </p>
                </div>

                {tratamientosUltima && (
                  <div className="pt-2 border-t border-gray-100/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Tratamientos Aplicados
                    </span>
                    <p className="text-sm font-sans text-clinica-dark font-medium">
                      {tratamientosUltima}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historial de Citas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">Historial de Citas</h2>

            {!citas || citas.length === 0 ? (
              <p className="text-gray-400 font-sans text-sm">Este paciente no tiene citas registradas.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {citas.map((c) => {
                  // Supabase puede mapear relaciones como arreglos
                  const consulta = Array.isArray(c.consultas) ? c.consultas[0] : c.consultas;
                  const medico = Array.isArray(consulta?.odontologos)
                    ? consulta?.odontologos[0]
                    : consulta?.odontologos;

                  const tratamientos = (consulta?.detalle_consultas ?? [])
                    .map((d: any) =>
                      Array.isArray(d.tratamiento) ? d.tratamiento[0]?.nombre : d.tratamiento?.nombre
                    )
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div key={c.id_cita} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-sans">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {new Date(c.fecha_cita).toLocaleDateString("es-HN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {new Date(c.fecha_cita).toLocaleTimeString("es-HN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span
                          className={
                            "text-[10px] font-sans font-bold px-2 py-0.5 rounded-full " +
                            (ESTADO_BADGE[c.estado] ?? "bg-gray-100 text-gray-600")
                          }
                        >
                          {ESTADO_LABEL[c.estado] ?? c.estado}
                        </span>
                      </div>
                      <p className="font-sans font-semibold text-gray-900 text-sm">{c.motivo}</p>

                      {consulta && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                          {medico && (
                            <p className="text-xs text-gray-400 font-sans">
                              Atendido por Dr(a). {medico.primer_nombre} {medico.primer_apellido}
                            </p>
                          )}
                          {consulta.diagnostico && (
                            <p className="text-sm text-gray-600 font-sans">
                              <span className="font-semibold">Diagnóstico:</span> {consulta.diagnostico}
                            </p>
                          )}
                          {consulta.observaciones && (
                            <p className="text-sm text-gray-600 font-sans">
                              <span className="font-semibold">Observaciones:</span> {consulta.observaciones}
                            </p>
                          )}
                          {tratamientos && (
                            <p className="text-sm text-gray-600 font-sans">
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