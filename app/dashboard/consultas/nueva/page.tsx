import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/app/components/sidebar";
import ConsultaForm from "@/app/components/consultaform";
import { ArrowLeft, ClipboardPlus } from "lucide-react";
import Link from "next/link";

export default async function NuevaConsultaPage() {
    type CitaDisponible = {
        id_cita: string;
        fecha_cita: string;
        motivo: string;
        profiles: { nombre: string; apellido: string } | null;
    };

    const supabase = await createClient();
    
    const { data: todasCitas } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, profiles(nombre, apellido)")
    .order("fecha_cita", { ascending: false })
    .limit(50)
    .returns<CitaDisponible[]>();

    const { data: citasConConsulta } = await supabase
    .from("consultas")
    .select("id_cita");

    const idsConConsulta = new Set(citasConConsulta?.map((c) => c.id_cita) ?? []);

    const citasDisponibles = (todasCitas ?? [])
    .filter((c) => !idsConConsulta.has(c.id_cita))
    .slice(0, 20);
        
    const { data: tratamientos } = await supabase
        .from("tratamiento")
        .select("id_tratamiento, nombre, precio")
        .order("nombre");

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/dashboard/consultas" />
            <div className="flex-1 p-8">
                <Link
                    href="/dashboard/consultas"
                    className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-4">
                    <ArrowLeft size={16} /> Volver a Consultas
                </Link>
                <div className="flex items-center gap-3 bg-gray-50">
            <ClipboardPlus size={28} className="text-clinica-dark" />
            <h1 className="text-3xl font-sans font-bold text-gray-900 mb-1">Nueva Consulta</h1>
            </div>
            <p className="text-gray-500 font-sans mb-6">Registra la atención médica y los tratamientos realizados.</p>

            <ConsultaForm
                citas={citasDisponibles ?? []}
                tratamientos={tratamientos ?? []}
                idOdontologo={user?.id ?? ""}
            />
            </div>
        </div>
    );
}
