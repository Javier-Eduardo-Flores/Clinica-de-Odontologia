// app/dashboard/pacientes/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, FileText, Mail, Phone, MapPin, Calendar, User, Cake } from "lucide-react";
import Sidebar from "@/app/components/sidebar";
import { calcularEdad } from "@/utils/fechas";

const GENERO_LABEL: Record<number, string> = {
  1: "Masculino",
  2: "Femenino",
};

export default async function PacienteDetallePage({
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
    .select("*")
    .eq("id_paciente", id)
    .maybeSingle();

  if (!paciente) notFound();

  const esAdmin = perfil.rol === "admin";
  const esRecepcionista = perfil.rol === "recepcionista";
  const puedeEditar = esAdmin || esRecepcionista;
  const puedeEliminar = esAdmin;

  const fechaNacimiento = (() => {
    const [y, m, d] = paciente.fecha_nacimiento.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-HN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  const edad = calcularEdad(paciente.fecha_nacimiento);

  const fechaRegistro = new Date(paciente.fecha_registro).toLocaleDateString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
            Volver
          </Link>
        </header>

        <main className="p-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-sans font-bold text-gray-900">
              {paciente.primer_nombre} {paciente.segundo_nombre ?? ""}{" "}
              {paciente.primer_apellido} {paciente.segundo_apellido ?? ""}
            </h1>
            <div className="flex gap-2">
              {puedeEditar && (
                <Link
                  href={"/dashboard/pacientes/" + id + "/editar"}
                  className="flex items-center gap-1.5 text-sm font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit size={14} />
                  Editar
                </Link>
              )}
              {puedeEliminar && (
                <Link
                  href={"/dashboard/pacientes/" + id + "/eliminar"}
                  className="flex items-center gap-1.5 text-sm font-sans font-semibold text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar
                </Link>
              )}
              <Link
                href={"/dashboard/pacientes/" + id + "/expediente"}
                className="flex items-center gap-1.5 text-sm font-sans font-semibold text-white bg-clinica-dark px-3 py-1.5 rounded-lg hover:bg-clinica-medium transition-colors"
              >
                <FileText size={14} />
                Expediente
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Información Personal
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <User size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">DNI</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{paciente.dni}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <Calendar size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Fecha de Nacimiento</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{fechaNacimiento}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <Cake size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Edad</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{edad != null ? `${edad} años` : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <User size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Género</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">
                    {GENERO_LABEL[paciente.genero ?? 0] ?? "No especificado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <span className={"text-xs font-sans font-bold px-2 py-0.5 rounded-full " + (paciente.estado === 1 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                    {paciente.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Contacto
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <Mail size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Correo</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{paciente.correo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <Phone size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Teléfono</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{paciente.telefono}</p>
                </div>
              </div>
              {paciente.direccion && (
                <div className="flex items-center gap-3 col-span-2">
                  <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                    <MapPin size={16} className="text-clinica-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans">Dirección</p>
                    <p className="text-sm font-sans font-semibold text-gray-900">{paciente.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Registro
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                <Calendar size={16} className="text-clinica-dark" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Fecha de Registro</p>
                <p className="text-sm font-sans font-semibold text-gray-900">{fechaRegistro}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
