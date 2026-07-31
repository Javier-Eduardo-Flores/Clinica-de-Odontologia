import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import EditarJornadaForm from "./EditarJornadaForm";

export default async function EditarJornadaPage({
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

  const { data: jornada } = await supabase
    .from("jornadas")
    .select("id_jornada, nombre, hora_inicio, hora_fin")
    .eq("id_jornada", id)
    .maybeSingle();

  if (!jornada) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link
          href="/dashboard/jornadas"
          className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-4"
        >
          <ArrowLeft size={16} />
          Volver a jornadas
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="text-clinica-dark" size={26} />
          </div>

          <h1 className="text-2xl font-sans font-bold text-clinica-dark mb-1 text-center">
            Editar Jornada
          </h1>
          <p className="text-center text-gray-500 font-sans text-sm mb-6">
            {jornada.nombre}
          </p>

          <EditarJornadaForm jornada={jornada} />
        </div>
      </div>
    </div>
  );
}
