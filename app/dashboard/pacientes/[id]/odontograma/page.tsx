// app/dashboard/pacientes/[id]/odontograma/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { ArrowLeft } from "lucide-react";
import { Odontograma } from "@/app/components/odontograma/Odontograma";
import { obtenerDientesConEstado } from "@/app/actions/obtener-dientes";
import ActualizarOdontogramaForm from "@/app/components/odontograma/ActualizarOdontogramaForm";

export default async function OdontogramaPacientePage({
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

  if (!perfil || !["admin", "doctor", "recepcionista"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id_paciente, primer_nombre, primer_apellido")
    .eq("id_paciente", id)
    .maybeSingle();

  if (!paciente) notFound();

  const dientes = await obtenerDientesConEstado(id);

  const { data: catalogoDientes } = await supabase
    .from("diente")
    .select("id_diente, numero_fdi, nombre")
    .order("numero_fdi", { ascending: true });

  const { data: catalogoEstados } = await supabase
    .from("estado_diente")
    .select("id_estado_diente, nombre, color")
    .order("nombre", { ascending: true });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/pacientes" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/pacientes"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver a pacientes
          </Link>
        </header>

        <main className="p-8 max-w-5xl">
          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-1">
            Odontograma — {paciente.primer_nombre} {paciente.primer_apellido}
          </h1>
          <p className="text-gray-500 font-sans mb-6">
            Estado actual y registro de nuevos hallazgos por diente.
          </p>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <Odontograma dientes={dientes} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-sans font-bold text-gray-900 mb-4">
              Registrar nuevo estado
            </h2>
            <ActualizarOdontogramaForm
              idPaciente={paciente.id_paciente}
              dientes={catalogoDientes ?? []}
              estados={catalogoEstados ?? []}
            />
          </div>
        </main>
      </div>
    </div>
  );
}