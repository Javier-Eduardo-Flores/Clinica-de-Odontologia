import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import EditarEspecialidadForm from "./EditarEspecialidadForm";

export default async function EditarEspecialidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!perfil || perfil.rol !== "admin") {
    redirect("/dashboard");
  }

  const { data: especialidad } = await supabase
    .from("especialidad")
    .select("id_especialidad, nombre, descripcion")
    .eq("id_especialidad", id)
    .maybeSingle();

  if (!especialidad) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link
          href="/dashboard/especialidades"
          className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-4"
        >
          <ArrowLeft size={16} />
          Volver a especialidades
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <Edit className="text-clinica-dark" size={26} />
          </div>

          <h1 className="text-2xl font-sans font-bold text-clinica-dark mb-1 text-center">
            Editar Especialidad
          </h1>
          <p className="text-center text-gray-500 font-sans text-sm mb-6">
            {especialidad.nombre}
          </p>

          <EditarEspecialidadForm especialidad={especialidad} />
        </div>
      </div>
    </div>
  );
}
