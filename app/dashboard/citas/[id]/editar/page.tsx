// app/dashboard/citas/[id]/editar/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import EditarCitaForm from "@/app/components/citas/EditarCitaForm";

export default async function EditarCitaPage({
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
  if (!perfil) redirect("/login");

  const { data: cita } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, estado, id_usuario")
    .eq("id_cita", id)
    .maybeSingle();

  if (!cita) notFound();

  const esStaff = ["admin", "doctor", "recepcionista"].includes(perfil.rol);
  const esDueno = cita.id_usuario === user.id;

  // Un paciente solo puede editar SU propia cita, y solo si sigue
  // pendiente. El staff puede editar cualquiera.
  if (!esStaff && (!esDueno || cita.estado !== 1)) {
    redirect("/dashboard");
  }

  const fechaObj = new Date(cita.fecha_cita);
  const fechaInicial = fechaObj.toISOString().split("T")[0];
  const horaInicial = fechaObj.toTimeString().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
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
            <CalendarClock className="text-clinica-dark" size={26} />
          </div>

          <h1 className="text-2xl font-sans font-bold text-clinica-dark mb-1 text-center">
            Modificar Cita
          </h1>
          <p className="text-center text-gray-500 font-sans text-sm mb-6">
            Ajusta la fecha, hora o motivo de esta cita.
          </p>

          <EditarCitaForm
            idCita={cita.id_cita}
            fechaInicial={fechaInicial}
            horaInicial={horaInicial}
            motivoInicial={cita.motivo}
          />
        </div>
      </div>
    </div>
  );
}