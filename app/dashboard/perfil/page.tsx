import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit, Mail, Phone, MapPin, Calendar, User, Briefcase, DollarSign } from "lucide-react";
import Sidebar from "@/app/components/sidebar";

const GENERO_LABEL: Record<number, string> = {
  1: "Masculino",
  2: "Femenino",
};

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  recepcionista: "Recepcionista",
  doctor: "Odontólogo",
  paciente: "Paciente",
};

export default async function PerfilPage() {
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

  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  let paciente = null;
  let odontologo = null;

  if (perfil.rol === "paciente") {
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
    odontologo = o;
  }

  const formatearFecha = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-HN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/perfil" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <span>&larr; Volver al Dashboard</span>
          </Link>
        </header>

        <main className="p-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-sans font-bold text-gray-900">{nombreCompleto}</h1>
              <p className="text-sm text-gray-500 font-sans mt-1">{ROL_LABEL[perfil.rol] ?? perfil.rol}</p>
            </div>
            <Link
              href="/dashboard/perfil/editar"
              className="flex items-center gap-1.5 text-sm font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit size={14} />
              Editar Perfil
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Información Personal
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {paciente && (
                <>
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
                      <p className="text-sm font-sans font-semibold text-gray-900">{formatearFecha(paciente.fecha_nacimiento)}</p>
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
                </>
              )}
              {odontologo && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                      <User size={16} className="text-clinica-dark" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-sans">DNI</p>
                      <p className="text-sm font-sans font-semibold text-gray-900">{odontologo.dni}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                      <Calendar size={16} className="text-clinica-dark" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-sans">Fecha de Nacimiento</p>
                      <p className="text-sm font-sans font-semibold text-gray-900">{formatearFecha(odontologo.fecha_nacimiento)}</p>
                    </div>
                  </div>
                  {odontologo.sueldo != null && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                        <DollarSign size={16} className="text-clinica-dark" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-sans">Sueldo</p>
                        <p className="text-sm font-sans font-semibold text-gray-900">L. {Number(odontologo.sueldo).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                      <span className={"text-xs font-sans font-bold px-2 py-0.5 rounded-full " + (odontologo.estado === 1 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                        {odontologo.estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </>
              )}
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
                  <p className="text-sm font-sans font-semibold text-gray-900">{perfil.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <Phone size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Teléfono</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{perfil.telefono}</p>
                </div>
              </div>
              {(paciente?.direccion || odontologo?.direccion) && (
                <div className="flex items-center gap-3 col-span-2">
                  <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                    <MapPin size={16} className="text-clinica-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans">Dirección</p>
                    <p className="text-sm font-sans font-semibold text-gray-900">{paciente?.direccion ?? odontologo?.direccion}</p>
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
                <p className="text-xs text-gray-400 font-sans">Rol</p>
                <p className="text-sm font-sans font-semibold text-gray-900">{ROL_LABEL[perfil.rol] ?? perfil.rol}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
