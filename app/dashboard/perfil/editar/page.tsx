import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import EditarPerfilForm from "@/app/components/perfil/EditarPerfilForm";

export default async function EditarPerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, apellido, email, telefono, rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil) redirect("/dashboard");

  let paciente;
  const esPaciente = perfil.rol === "paciente";

  if (esPaciente) {
    const { data: p } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id_paciente", user.id)
      .maybeSingle();
    paciente = p;
  } else {
    const { data: o } = await supabase
      .from("odontologos")
      .select("*")
      .eq("id_odontologo", user.id)
      .maybeSingle();
    if (o) {
      paciente = {
        ...o,
        telefono: perfil.telefono,
        id_paciente: o.id_odontologo,
      };
    }
  }

  if (!paciente) {
    paciente = {
      id_paciente: user.id,
      dni: "—",
      primer_nombre: perfil.nombre,
      segundo_nombre: "",
      primer_apellido: perfil.apellido,
      segundo_apellido: "",
      telefono: perfil.telefono,
      estado: 1,
      correo: perfil.email,
      fecha_nacimiento: "",
      direccion: "",
      genero: null,
      fecha_registro: "",
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link
          href="/dashboard/perfil"
          className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark mb-4"
        >
          <ArrowLeft size={16} />
          Volver al perfil
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <Edit className="text-clinica-dark" size={26} />
          </div>

          <h1 className="text-2xl font-sans font-bold text-clinica-dark mb-1 text-center">
            Editar Perfil
          </h1>
          <p className="text-center text-gray-500 font-sans text-sm mb-6">
            {perfil.nombre} {perfil.apellido}
          </p>

          <EditarPerfilForm paciente={paciente} rol={perfil.rol} />
        </div>
      </div>
    </div>
  );
}
