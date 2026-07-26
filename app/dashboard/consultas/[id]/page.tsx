import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import EditarConsultaButton from "@/app/components/editarconsultaboton";
import Sidebar from "@/app/components/sidebar";

export default async function DetalleConsultaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    type CitaConPaciente = {
        id_usuario: string;
        fecha_cita: string;
        motivo: string;
        profiles: { nombre: string; apellido: string } | null;
};
    type DetalleConTratamiento = {
        detalle_consulta_id: string;
        id_tratamiento: string;
        cantidad: number;
        observaciones: string | null;
        tratamiento: { nombre: string; precio: number } | null;
};

    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id_profile", user?.id)
        .maybeSingle();

    const { data: consulta, error: errorConsulta } = await supabase
        .from("consultas")
        .select("id_consulta, id_cita, fecha, diagnostico, observaciones, id_odontologo")
        .eq("id_consulta", id)
        .maybeSingle();

    if (errorConsulta) {
        console.error("Error al traer consulta:", errorConsulta);
    }

    if (!consulta) notFound();

    const { data: cita } = await supabase
        .from("citas")
        .select("id_usuario, fecha_cita, motivo, profiles(nombre, apellido)")
        .eq("id_cita", consulta.id_cita)
        .maybeSingle()
        .returns<CitaConPaciente>();;

    const { data: odontologo } = await supabase
        .from("odontologos")
        .select("primer_nombre, primer_apellido")
        .eq("id_odontologo", consulta.id_odontologo)
        .maybeSingle();

    const { data: detalles } = await supabase
        .from("detalle_consultas")
        .select("detalle_consulta_id, id_tratamiento, cantidad, observaciones, tratamiento(nombre, precio)")
        .eq("id_consulta", id)
        .returns<DetalleConTratamiento[]>();

    const { data: catalogoTratamientos } = await supabase
        .from("tratamiento")
        .select("id_tratamiento, nombre, precio")
        .order("nombre");

    const idUsuarioPaciente = cita?.id_usuario;

    let esUltimaConsulta = true;
    if (idUsuarioPaciente) {
        const { data: consultasDelPaciente } = await supabase
            .from("consultas")
            .select("id_consulta, fecha, citas!inner(id_usuario)")
            .eq("citas.id_usuario", idUsuarioPaciente)
            .order("fecha", { ascending: false })
            .limit(1);

        esUltimaConsulta = consultasDelPaciente?.[0]?.id_consulta === id;
    }

    const esAdmin = perfil?.rol === "admin";
    const esDoctor = perfil?.rol === "doctor";

    const puedeEditar = esAdmin || (esDoctor && esUltimaConsulta);
    const motivoBloqueo = !esUltimaConsulta
        ? "Solo se puede editar la consulta más reciente de este paciente"
        : undefined;

    const nombrePaciente = cita?.profiles?.nombre ?? "";
    const apellidoPaciente = cita?.profiles?.apellido ?? "";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/dashboard/consultas" />
            
            <div className="flex-1 p-8 max-w-5xl">

            <div className="flex justify-between items-center mb-4">
                <Link href="/dashboard/consultas" className="flex items-center gap-2 text-sm font-sans text-gray-500 hover:text-clinica-dark">
                    <ArrowLeft size={16} /> Volver a Consultas
                </Link>

                <EditarConsultaButton
                    idConsulta={consulta.id_consulta}
                    diagnostico={consulta.diagnostico}
                    observaciones={consulta.observaciones}
                    detallesExistentes={detalles ?? []}
                    tratamientos={catalogoTratamientos ?? []}
                    puedeEditar={puedeEditar}
                    motivoBloqueo={motivoBloqueo}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-sans font-bold text-gray-900">
                                {nombrePaciente} {apellidoPaciente}
                        </h1>
                        <p className="text-sm text-gray-500 font-sans">
                                Atendido por {odontologo?.primer_nombre} {odontologo?.primer_apellido}
                        </p>
                    </div>
                    <span className="text-sm font-sans font-semibold text-gray-500">
                        {new Date(consulta.fecha).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                </div>

                <div className="mb-4">
                    <p className="text-xs font-sans font-bold text-gray-400 uppercase mb-1">Diagnóstico</p>
                    <p className="font-sans text-gray-800">{consulta.diagnostico}</p>
                </div>

                {consulta.observaciones && (
                    <div>
                        <p className="text-xs font-sans font-bold text-gray-400 uppercase mb-1">Observaciones</p>
                        <p className="font-sans text-gray-800">{consulta.observaciones}</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-sans font-bold text-gray-900 mb-4">Tratamientos Realizados</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                            <th className="py-2">Tratamiento</th>
                            <th className="py-2">Cantidad</th>
                            <th className="py-2">Precio Unit.</th>
                            <th className="py-2">Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalles?.map((d) => (
                            <tr key={d.detalle_consulta_id} className="border-b border-gray-50 last:border-0">
                                <td className="py-3 font-sans font-semibold text-gray-900">{d.tratamiento?.nombre}</td>
                                <td className="py-3 font-sans text-gray-600">{d.cantidad}</td>
                                <td className="py-3 font-sans text-gray-600">${Number(d.tratamiento?.precio).toLocaleString("es")}</td>
                                <td className="py-3 font-sans text-gray-500 text-sm">{d.observaciones || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
}