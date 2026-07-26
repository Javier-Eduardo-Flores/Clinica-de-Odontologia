import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/app/components/sidebar";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import ConsultaAcciones from "@/app/components/consultaacciones";

export default async function ConsultasPage() {
type ConsultaConRelaciones = {
    id_consulta: string;
    fecha: string;
    diagnostico: string;
    citas: {
    fecha_cita: string;
    motivo: string;
    profiles: { nombre: string; apellido: string } | null;
    } | null;
    odontologos: { primer_nombre: string; primer_apellido: string } | null;
};

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user?.id)
    .maybeSingle();

    const esAdmin = perfil?.rol === "admin";

    const { data: consultas } = await supabase
    .from("consultas")
    .select(`
        id_consulta,
        fecha,
        diagnostico,
        citas ( fecha_cita, motivo, profiles ( nombre, apellido ) ),
        odontologos ( primer_nombre, primer_apellido )
    `)
    .order("fecha", { ascending: false })
    .returns<ConsultaConRelaciones[]>();
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/dashboard/consultas" />

            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-3 bg-gray-50">
                        <ClipboardList size={28} className="text-clinica-dark" />
                        <h1 className="text-3xl font-sans font-bold text-gray-900 mb-1">Consultas</h1>
                        </div>
                        <p className="text-gray-500 font-sans">Historial de atenciones clínicas registradas.</p>
                    </div>
                    <Link
                        href="/dashboard/consultas/nueva"
                        className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-clinica-medium"
                    >
                        <Plus size={18} /> Nueva Consulta
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-xs font-sans font-bold text-gray-500 uppercase">
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Paciente</th>
                            <th className="px-6 py-4">Odontólogo</th>
                            <th className="px-6 py-4">Diagnóstico</th>
                            <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultas?.map((c) => (
                            <tr key={c.id_consulta} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td className="px-6 py-4 font-sans text-gray-600">
                                {new Date(c.fecha).toLocaleDateString("es")}
                            </td>
                            <td className="px-6 py-4 font-sans font-semibold text-gray-900">
                                {c.citas?.profiles?.nombre} {c.citas?.profiles?.apellido}
                            </td>
                            <td className="px-6 py-4 font-sans text-gray-600">
                                {c.odontologos?.primer_nombre} {c.odontologos?.primer_apellido}
                            </td>
                            <td className="px-6 py-4 font-sans text-gray-600 text-sm max-w-xs truncate">
                                {c.diagnostico}
                            </td>
                            <td className="px-6 py-4">
                                <ConsultaAcciones idConsulta={c.id_consulta} esAdmin={esAdmin} />
                            </td>
                        </tr>
                    ))}

                            {consultas?.length === 0 && (
                                <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-sans">
                                    Aún no hay consultas registradas.
                                </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}