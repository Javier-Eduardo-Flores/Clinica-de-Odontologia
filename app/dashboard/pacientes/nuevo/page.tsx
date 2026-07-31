// app/dashboard/pacientes/nuevo/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import PacienteForm from "@/app/components/pacientes/PacienteForm";

export default async function NuevoPacientePage() {
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

  if (!perfil || !["admin", "recepcionista"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link
          href="/dashboard/pacientes"
          className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-4"
        >
          <ArrowLeft size={16} />
          Volver a pacientes
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <UserPlus className="text-clinica-dark" size={26} />
          </div>

          <h1 className="text-2xl font-sans font-bold text-clinica-dark mb-1 text-center">
            Nuevo Paciente
          </h1>
          <p className="text-center text-gray-500 font-sans text-sm mb-6">
            Completa los datos para registrar un nuevo paciente.
          </p>

          <PacienteForm />
        </div>
      </div>
    </div>
  );
}
