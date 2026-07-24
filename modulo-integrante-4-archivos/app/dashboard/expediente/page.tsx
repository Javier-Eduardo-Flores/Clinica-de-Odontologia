import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Stethoscope, Eye, ClipboardList } from "lucide-react";
import AlertaMedica from "@/Components/UI/expediente/AlertaMedica";
import { obtenerExpediente, obtenerHistorialConsultas } from "@/app/actions/consultas";

export default async function ExpedientePage() {
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

  // Esta vista es la del portal del paciente ("Mi expediente completo").
  // La vista de expediente de un paciente específico para staff vive en
  // /dashboard/pacientes/[id] (Integrante 1), que puede reutilizar el
  // componente <AlertaMedica /> y las funciones de app/actions/consultas.ts.
  if (perfil.rol !== "paciente") {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg mx-auto text-center">
          <ClipboardList size={32} className="text-clinica-dark mx-auto mb-3" />
          <h1 className="text-xl font-sans font-bold text-gray-900 mb-2">
            Selecciona un paciente
          </h1>
          <p className="text-sm text-gray-500 font-sans">
            El expediente de un paciente se consulta desde su ficha en{" "}
            <Link href="/dashboard/pacientes" className="text-clinica-dark font-semibold hover:underline">
              Gestión de Pacientes
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const [expediente, historial] = await Promise.all([
    obtenerExpediente(user.id),
    obtenerHistorialConsultas(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-sans font-bold text-gray-900 mb-1">Mi Expediente Clínico</h1>
        <p className="text-gray-500 font-sans mb-6">
          {perfil.nombre} {perfil.apellido}
        </p>

        <div className="mb-8">
          <AlertaMedica expediente={expediente} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={18} className="text-clinica-dark" />
            <h2 className="text-xl font-sans font-bold text-gray-900">Historial de Consultas</h2>
          </div>

          {historial.length === 0 ? (
            <p className="text-sm text-gray-400 font-sans">Todavía no tienes consultas registradas.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {historial.map((c) => (
                <Link
                  key={c.id_consulta}
                  href={`/dashboard/expediente/${c.id_consulta}`}
                  className="border border-gray-100 rounded-lg p-4 hover:border-clinica-dark transition-colors flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-1">
                      <Calendar size={12} />
                      {new Date(c.fecha).toLocaleDateString("es-HN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <p className="font-sans font-semibold text-gray-900 text-sm mb-1">
                      {c.tratamientos.length > 0
                        ? c.tratamientos.map((t) => t.nombre).join(", ")
                        : "Consulta general"}
                    </p>
                    <p className="text-xs text-gray-500 font-sans">{c.doctor}</p>
                  </div>
                  <Eye size={16} className="text-gray-400 shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
