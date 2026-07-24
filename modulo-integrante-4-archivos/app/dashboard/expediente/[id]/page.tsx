import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Stethoscope, FileText } from "lucide-react";
import { obtenerConsultaDetalle } from "@/app/actions/consultas";

type ConsultaDetalleRow = {
  id_consulta: string;
  fecha: string;
  diagnostico: string | null;
  evolucion: string | null;
  citas: { id_usuario: string; motivo: string | null } | null;
  odontologos: { primer_nombre: string; primer_apellido: string } | null;
  detalle_consultas: {
    id_detalle_consulta: string;
    cantidad: number;
    notas: string | null;
    tratamiento: { nombre: string; precio: number } | null;
  }[];
};

export default async function ConsultaDetallePage({ params }: { params: Promise<{ id: string }> }) {
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
  if (!perfil) redirect("/login");

  const consulta = (await obtenerConsultaDetalle(id)) as unknown as ConsultaDetalleRow | null;

  // RLS ya filtra el acceso en la base de datos; esto solo cubre el caso
  // "no encontrado" para mostrar una página 404 amigable.
  if (!consulta) notFound();

  const doctor = consulta.odontologos
    ? `Dr(a). ${consulta.odontologos.primer_nombre} ${consulta.odontologos.primer_apellido}`
    : "Sin asignar";

  const volver = perfil.rol === "paciente" ? "/dashboard/expediente" : "/dashboard/pacientes";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        <Link
          href={volver}
          className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-6"
        >
          <ArrowLeft size={16} /> Volver
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-2">
            <Calendar size={12} />
            {new Date(consulta.fecha).toLocaleDateString("es-HN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
          <h1 className="text-2xl font-sans font-bold text-gray-900 mb-1">
            {consulta.citas?.motivo || "Consulta"}
          </h1>
          <p className="text-sm text-gray-500 font-sans">Atendido por {doctor}</p>
        </div>

        {(consulta.diagnostico || consulta.evolucion) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-clinica-dark" />
              <h2 className="text-lg font-sans font-bold text-gray-900">Notas Clínicas</h2>
            </div>
            {consulta.diagnostico && (
              <div className="mb-4">
                <p className="text-xs font-sans font-semibold text-gray-400 uppercase mb-1">Diagnóstico</p>
                <p className="text-sm text-gray-700 font-sans whitespace-pre-wrap">{consulta.diagnostico}</p>
              </div>
            )}
            {consulta.evolucion && (
              <div>
                <p className="text-xs font-sans font-semibold text-gray-400 uppercase mb-1">Evolución</p>
                <p className="text-sm text-gray-700 font-sans whitespace-pre-wrap">{consulta.evolucion}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={18} className="text-clinica-dark" />
            <h2 className="text-lg font-sans font-bold text-gray-900">Tratamientos Realizados</h2>
          </div>

          {consulta.detalle_consultas.length === 0 ? (
            <p className="text-sm text-gray-400 font-sans">Sin tratamientos registrados.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-3">Tratamiento</th>
                  <th className="py-3">Cantidad</th>
                  <th className="py-3">Notas</th>
                </tr>
              </thead>
              <tbody>
                {consulta.detalle_consultas.map((d) => (
                  <tr key={d.id_detalle_consulta} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-sans font-semibold text-gray-900">
                      {d.tratamiento?.nombre ?? "—"}
                    </td>
                    <td className="py-4 text-gray-600 font-sans text-sm">{d.cantidad}</td>
                    <td className="py-4 text-gray-600 font-sans text-sm">{d.notas || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
