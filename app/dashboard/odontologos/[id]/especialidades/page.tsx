import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import Sidebar from "@/app/components/sidebar";
import { getCurrentUser, getUserRole } from "@/utils/supabase/helpers";
import { asignarEspecialidadOdontologo, removerEspecialidadOdontologo } from "@/app/actions/especialidades";

async function asignarAction(id: string, formData: FormData) {
  "use server";
  await asignarEspecialidadOdontologo(id, formData);
}

async function removerAction(id: string, formData: FormData) {
  "use server";
  await removerEspecialidadOdontologo(id, formData);
}

export default async function OdontologoEspecialidadesPage({
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

  const [{ data: odontologo }, { data: todas }, { data: asignadas }] =
    await Promise.all([
      supabase
        .from("odontologos")
        .select("id_odontologo, primer_nombre, primer_apellido")
        .eq("id_odontologo", id)
        .maybeSingle(),
      supabase
        .from("especialidad")
        .select("id_especialidad, nombre")
        .order("nombre", { ascending: true }),
      supabase
        .from("odontologosxespecialidad")
        .select("id_especialidad")
        .eq("id_odontologo", id),
    ]);

  if (!odontologo) notFound();

  const idsAsignados = new Set((asignadas ?? []).map((ea) => ea.id_especialidad));
  const asignadasDetalle = (todas ?? []).filter((e) => idsAsignados.has(e.id_especialidad));
  const disponibles = (todas ?? []).filter((e) => !idsAsignados.has(e.id_especialidad));

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
              Especialidades de {odontologo.primer_nombre} {odontologo.primer_apellido}
            </h1>
            <p className="text-sm text-gray-500 font-sans mt-1">
              Administra las especialidades asignadas a este odontólogo.
            </p>
          </div>

          {/* Especialidades asignadas */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Especialidades Asignadas
            </h2>
            {!asignadasDetalle || asignadasDetalle.length === 0 ? (
              <p className="text-sm text-gray-400 font-sans">Este odontólogo no tiene especialidades asignadas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {asignadasDetalle.map((esp) => (
                  <div
                    key={esp.id_especialidad}
                    className="flex items-center gap-1.5 bg-blue-50 text-clinica-dark font-sans font-semibold text-sm px-3 py-1.5 rounded-full"
                  >
                    <Check size={14} />
                    {esp.nombre}
                    <form action={removerAction.bind(null, id)} className="inline">
                      <input type="hidden" name="id_especialidad" value={esp.id_especialidad} />
                      <button
                        type="submit"
                        className="ml-1 hover:text-red-600 transition-colors"
                        title="Remover especialidad"
                      >
                        <X size={14} />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Asignar nueva especialidad */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Asignar Especialidad
            </h2>
            {!disponibles || disponibles.length === 0 ? (
              <p className="text-sm text-gray-400 font-sans">No hay más especialidades disponibles para asignar.</p>
            ) : (
              <form action={asignarAction.bind(null, id)} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">
                    Seleccionar especialidad
                  </label>
                  <select
                    name="id_especialidad"
                    required
                    className="w-full border border-gray-300 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                  >
                    <option value="">-- Selecciona --</option>
                    {disponibles.map((e) => (
                      <option key={e.id_especialidad} value={e.id_especialidad}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2.5 rounded-lg hover:bg-clinica-medium transition-colors whitespace-nowrap"
                >
                  Asignar
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
