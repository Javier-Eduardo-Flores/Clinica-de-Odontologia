import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { obtenerCitasSinConsulta } from "@/app/actions/consultas";
import ConsultaForm from "@/app/components/consultas/ConsultaForm";

export default async function NuevaConsultaPage() {
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

  // Solo el odontólogo (o un admin cubriendo la agenda) registra consultas.
  if (!perfil || (perfil.rol !== "doctor" && perfil.rol !== "admin")) {
    redirect("/dashboard");
  }

  const [citas, { data: tratamientos }] = await Promise.all([
    obtenerCitasSinConsulta(),
    supabase.from("tratamiento").select("id_tratamiento, nombre, precio").order("nombre"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-sans font-bold text-gray-900 mb-1">Atención de Consulta</h1>
        <p className="text-gray-500 font-sans mb-6">
          Registra el diagnóstico, la evolución y los tratamientos realizados en esta sesión.
        </p>

        <ConsultaForm citas={citas} tratamientos={tratamientos ?? []} />
      </div>
    </div>
  );
}
