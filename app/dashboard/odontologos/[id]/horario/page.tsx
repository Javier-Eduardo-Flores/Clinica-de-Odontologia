import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import Sidebar from "@/app/components/sidebar";
import { getCurrentUser, getUserRole } from "@/utils/supabase/helpers";
import { asignarJornadaOdontologo, removerJornadaOdontologo } from "@/app/actions/jornadas";
import { DIAS_SEMANA, formatearHora } from "@/utils/horarios";

async function asignarAction(id: string, dia: number, formData: FormData) {
  "use server";
  await asignarJornadaOdontologo(id, dia, formData);
}

async function removerAction(id: string, dia: number) {
  "use server";
  await removerJornadaOdontologo(id, dia);
}

export default async function OdontologoHorarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rol = await getUserRole();
  if (rol !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const [{ data: odontologo }, { data: jornadas }, { data: asignaciones }] =
    await Promise.all([
      supabase
        .from("odontologos")
        .select("id_odontologo, primer_nombre, primer_apellido")
        .eq("id_odontologo", id)
        .maybeSingle(),
      supabase
        .from("jornadas")
        .select("id_jornada, nombre, hora_inicio, hora_fin")
        .order("hora_inicio", { ascending: true }),
      supabase
        .from("odontologos_jornadas")
        .select("dia_semana, id_jornada")
        .eq("id_odontologo", id),
    ]);

  if (!odontologo) notFound();

  const horarioPorDia: Record<number, { id_jornada: string; nombre: string; hora_inicio: string; hora_fin: string }> = {};
  (asignaciones ?? []).forEach((a: any) => {
    const j = (jornadas ?? []).find((j) => j.id_jornada === a.id_jornada);
    if (j) horarioPorDia[a.dia_semana] = j;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/odontologos" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href={"/dashboard/odontologos/" + id}
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver al odontólogo
          </Link>
        </header>

        <main className="p-8 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-sans font-bold text-gray-900">
              Horario de {odontologo.primer_nombre} {odontologo.primer_apellido}
            </h1>
            <p className="text-sm text-gray-500 font-sans mt-1">
              Asigna la jornada de trabajo para cada día de la semana.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-2">
              Horario Semanal
            </h2>
            <p className="text-xs text-gray-400 font-sans mb-4">
              Un odontólogo puede tener una jornada por día. Si ya tiene una asignada, selecciona otra y presiona Guardar para cambiarla.
            </p>

            {!jornadas || jornadas.length === 0 ? (
              <p className="text-sm text-gray-400 font-sans">
                No hay jornadas creadas.{" "}
                <Link href="/dashboard/jornadas" className="text-clinica-dark font-semibold underline">
                  Crea jornadas
                </Link>{" "}
                primero.
              </p>
            ) : (
              <div>
                {DIAS_SEMANA.map((dia) => {
                  const actual = horarioPorDia[dia.valor];
                  return (
                    <div
                      key={dia.valor}
                      className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                    >
                      <div className="w-24 font-sans font-semibold text-gray-900 text-sm">
                        {dia.nombre}
                      </div>

                      <div className="flex-1 min-w-40">
                        {actual ? (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-clinica-dark font-sans font-semibold text-sm px-3 py-1.5 rounded-full">
                            <Check size={14} />
                            {actual.nombre} ({formatearHora(actual.hora_inicio)} - {formatearHora(actual.hora_fin)})
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300 italic">Sin jornada</span>
                        )}
                      </div>

                      <form action={asignarAction.bind(null, id, dia.valor)} className="flex items-center gap-2">
                        <select
                          name="id_jornada"
                          defaultValue={actual?.id_jornada ?? ""}
                          className="border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                        >
                          <option value="">-- Selecciona --</option>
                          {jornadas.map((j) => (
                            <option key={j.id_jornada} value={j.id_jornada}>
                              {j.nombre} ({formatearHora(j.hora_inicio)} - {formatearHora(j.hora_fin)})
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="bg-clinica-dark text-white font-sans font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-clinica-medium transition-colors whitespace-nowrap"
                        >
                          Guardar
                        </button>
                      </form>

                      {actual && (
                        <form action={removerAction.bind(null, id, dia.valor)}>
                          <button
                            type="submit"
                            className="text-red-500 hover:text-red-700 p-1.5 transition-colors"
                            title="Quitar jornada de este día"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
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
