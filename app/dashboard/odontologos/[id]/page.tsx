import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, User, DollarSign, Stethoscope, BookOpen, Clock } from "lucide-react";
import Sidebar from "@/app/components/sidebar";
import { DIAS_SEMANA, formatearHora } from "@/utils/horarios";

export default async function OdontologoDetallePage({
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

  if (!perfil || !["admin", "recepcionista"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  const { data: odontologo } = await supabase
    .from("odontologos")
    .select("*")
    .eq("id_odontologo", id)
    .maybeSingle();

  if (!odontologo) notFound();

  const { data: especialidadesData } = await supabase
    .from("odontologosxespecialidad")
    .select("id_especialidad, especialidad!inner(nombre)")
    .eq("id_odontologo", id);

  const especialidadesOdontologo = (especialidadesData ?? []).map((e: any) => ({
    id_especialidad: e.id_especialidad,
    nombre: e.especialidad?.nombre ?? "",
  }));

  const { data: horarioData } = await supabase
    .from("odontologos_jornadas")
    .select("dia_semana, id_jornada")
    .eq("id_odontologo", id);

  const idsJornadasAsignadas = (horarioData ?? []).map((h: any) => h.id_jornada);

  let jornadasHorario: { id_jornada: string; nombre: string; hora_inicio: string; hora_fin: string }[] = [];
  if (idsJornadasAsignadas.length > 0) {
    const { data: jd } = await supabase
      .from("jornadas")
      .select("id_jornada, nombre, hora_inicio, hora_fin")
      .in("id_jornada", idsJornadasAsignadas);
    jornadasHorario = jd ?? [];
  }

  const horarioPorDia: Record<number, any> = {};
  (horarioData ?? []).forEach((h: any) => {
    const j = jornadasHorario.find((j) => j.id_jornada === h.id_jornada);
    if (j) horarioPorDia[h.dia_semana] = j;
  });

  const esAdmin = perfil.rol === "admin";
  const puedeEditar = esAdmin;
  const puedeEliminar = esAdmin;

  const fechaNacimiento = (() => {
    const [y, m, d] = odontologo.fecha_nacimiento.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-HN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  const fechaRegistro = new Date(odontologo.fecha_registro).toLocaleDateString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatearSueldo = (sueldo: number) =>
    "L. " + sueldo.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/odontologos" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/odontologos"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        </header>

        <main className="p-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-sans font-bold text-gray-900">
              {odontologo.primer_nombre} {odontologo.segundo_nombre ?? ""}{" "}
              {odontologo.primer_apellido} {odontologo.segundo_apellido ?? ""}
            </h1>
            <div className="flex gap-2">
              {puedeEditar && (
                <Link
                  href={"/dashboard/odontologos/" + id + "/horario"}
                  className="flex items-center gap-1.5 text-sm font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Clock size={14} />
                  Horario
                </Link>
              )}
              {puedeEditar && (
                <Link
                  href={"/dashboard/odontologos/" + id + "/especialidades"}
                  className="flex items-center gap-1.5 text-sm font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <BookOpen size={14} />
                  Especialidades
                </Link>
              )}
              {puedeEditar && (
                <Link
                  href={"/dashboard/odontologos/" + id + "/editar"}
                  className="flex items-center gap-1.5 text-sm font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit size={14} />
                  Editar
                </Link>
              )}
              {puedeEliminar && (
                <Link
                  href={"/dashboard/odontologos/" + id + "/eliminar"}
                  className="flex items-center gap-1.5 text-sm font-sans font-semibold text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar
                </Link>
              )}
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
                  <p className="text-sm font-sans font-semibold text-gray-900">{odontologo.dni}</p>
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
                  <DollarSign size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Sueldo</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{formatearSueldo(odontologo.sueldo)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <span className={"text-xs font-sans font-bold px-2 py-0.5 rounded-full " + (odontologo.estado === 1 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                    {odontologo.estado === 1 ? "Activo" : "Inactivo"}
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
                  <p className="text-sm font-sans font-semibold text-gray-900">{odontologo.correo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                  <Phone size={16} className="text-clinica-dark" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans">Teléfono</p>
                  <p className="text-sm font-sans font-semibold text-gray-900">{odontologo.telefono}</p>
                </div>
              </div>
              {odontologo.direccion && (
                <div className="flex items-center gap-3 col-span-2">
                  <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                    <MapPin size={16} className="text-clinica-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans">Dirección</p>
                    <p className="text-sm font-sans font-semibold text-gray-900">{odontologo.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Especialidades
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center">
                <Stethoscope size={16} className="text-clinica-dark" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-sans">Especialidades asignadas</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {especialidadesOdontologo.length === 0 ? (
                    <span className="text-sm text-gray-400 font-sans">Ninguna</span>
                  ) : (
                    especialidadesOdontologo.map((esp) => (
                      <span key={esp.id_especialidad} className="text-xs font-sans font-semibold bg-blue-50 text-clinica-dark px-2 py-0.5 rounded-full">
                        {esp.nombre}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">
              Horario
            </h2>
            {Object.keys(horarioPorDia).length === 0 ? (
              <p className="text-sm text-gray-400 font-sans">
                Este odontólogo no tiene horario asignado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const actual = horarioPorDia[dia.valor];
                  if (!actual) return null;
                  return (
                    <div key={dia.valor} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-clinica-light flex items-center justify-center shrink-0">
                        <Clock size={16} className="text-clinica-dark" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-sans">{dia.nombre}</p>
                        <p className="text-sm font-sans font-semibold text-gray-900">
                          {actual.nombre} ({formatearHora(actual.hora_inicio)} - {formatearHora(actual.hora_fin)})
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
