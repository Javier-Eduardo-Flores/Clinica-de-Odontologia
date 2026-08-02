// app/dashboard/citas/agendar/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import CitaFormStaff from "@/app/components/citas/CitaFormStaff";

export default async function AgendarCitaStaffPage() {
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

  // Solo admin y recepcionista pueden agendar citas a nombre de un paciente.
  if (!perfil || !["admin", "recepcionista"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id_paciente, primer_nombre, primer_apellido, dni")
    .order("primer_nombre", { ascending: true });

  const { data: tratamientos } = await supabase
    .from("tratamiento")
    .select("id_tratamiento, nombre, precio, id_especialidad")
    .order("nombre", { ascending: true });

  const { data: odontologosData } = await supabase
    .from("odontologos")
    .select(`
      id_odontologo,
      primer_nombre,
      primer_apellido,
      odontologosxespecialidad (
        especialidad ( id_especialidad, nombre )
      )
    `)
    .eq("estado", 1)
    .order("primer_nombre", { ascending: true });

  const odontologosFormateados = odontologosData?.map(doc => ({
    id_odontologo: doc.id_odontologo,
    primer_nombre: doc.primer_nombre,
    primer_apellido: doc.primer_apellido,
    especialidades: doc.odontologosxespecialidad.map((oe: any) => oe.especialidad),
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-4"
        >
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <CalendarPlus className="text-clinica-dark" size={26} />
          </div>

          <h1 className="text-2xl font-sans font-bold text-clinica-dark mb-1 text-center">
            Agendar Cita a un Paciente
          </h1>
          <p className="text-center text-gray-500 font-sans text-sm mb-6">
            Selecciona el paciente, la fecha, hora, odontólogo y el tratamiento.
          </p>

          <CitaFormStaff
            pacientes={pacientes ?? []}
            tratamientos={tratamientos ?? []}
            odontologos={odontologosFormateados}
          />
        </div>
      </div>
    </div>
  );
}