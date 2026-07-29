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

  // 1. Agregamos id_odontologo a la consulta de la cita
  const { data: cita } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, estado, id_usuario, id_tratamiento, id_odontologo")
    .eq("id_cita", id)
    .maybeSingle();

  if (!cita) notFound();

  const esStaff = ["admin", "doctor", "recepcionista"].includes(perfil.rol);
  const esDueno = cita.id_usuario === user.id;

  if (!esStaff && (!esDueno || cita.estado !== 1)) {
    redirect("/dashboard");
  }

  const fechaObj = new Date(cita.fecha_cita);
  const fechaInicial = fechaObj.toISOString().split("T")[0];
  const horaInicial = fechaObj.toTimeString().slice(0, 5);

  const { data: tratamientos } = await supabase
    .from("tratamiento")
    .select("id_tratamiento, nombre, precio")
    .order("nombre", { ascending: true });

  // 2. Traemos la lista de odontólogos activos
  const { data: odontologos } = await supabase
    .from("odontologos")
    .select("id_odontologo, primer_nombre, primer_apellido")
    .eq("estado", 1)
    .order("primer_nombre", { ascending: true });

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
            Ajusta la fecha, hora, motivo u odontólogo de esta cita.
          </p>

          <EditarCitaForm
            idCita={cita.id_cita}
            fechaInicial={fechaInicial}
            horaInicial={horaInicial}
            idTratamientoInicial={cita.id_tratamiento}
            idOdontologoInicial={cita.id_odontologo} // <-- Pasamos el doctor inicial
            tratamientos={tratamientos ?? []}
            odontologos={odontologos ?? []} // <-- Pasamos la lista de doctores
          />
        </div>
      </div>
    </div>
  );
} 