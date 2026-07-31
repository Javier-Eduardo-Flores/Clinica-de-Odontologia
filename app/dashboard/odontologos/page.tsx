import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { Search, ArrowLeft, UserPlus, Stethoscope } from "lucide-react";

export default async function OdontologosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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

  const puedeCrear = perfil.rol === "admin";

  let query = supabase
    .from("odontologos")
    .select(
      "id_odontologo, primer_nombre, primer_apellido, correo, dni, odontologosxespecialidad(id_especialidad, especialidad(nombre))"
    )
    .order("primer_nombre", { ascending: true })
    .limit(30);

  if (q && q.trim().length > 0) {
    query = query.or(
      "primer_nombre.ilike.%" + q + "%,primer_apellido.ilike.%" + q + "%,correo.ilike.%" + q + "%,dni.ilike.%" + q + "%"
    );
  }

  const { data: odontologos } = await query;

  const obtenerEspecialidades = (o: any) =>
    (o.odontologosxespecialidad ?? [])
      .map((e: any) => e.especialidad?.nombre)
      .filter(Boolean);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/odontologos" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
          <form action="/dashboard/odontologos" method="GET" className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre, apellido, correo o DNI..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </form>
        </header>

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-sans font-bold text-gray-900">Odontólogos</h1>
            {puedeCrear && (
              <Link
                href="/dashboard/odontologos/nuevo"
                className="flex items-center gap-1.5 text-sm font-sans font-semibold text-white bg-clinica-dark px-4 py-2 rounded-lg hover:bg-clinica-medium transition-colors"
              >
                <UserPlus size={16} />
                Nuevo Odontólogo
              </Link>
            )}
          </div>

          {!odontologos || odontologos.length === 0 ? (
            <p className="text-gray-400 font-sans">No se encontraron odontólogos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {odontologos.map((o) => {
                const especialidades = obtenerEspecialidades(o);
                return (
                <div
                  key={o.id_odontologo}
                  className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-full bg-clinica-light flex items-center justify-center font-sans font-bold text-clinica-dark shrink-0">
                    {o.primer_nombre?.[0]}{o.primer_apellido?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-sans font-semibold text-gray-900 text-sm">
                      {o.primer_nombre} {o.primer_apellido}
                    </p>
                    <p className="text-xs text-gray-400">{o.correo}</p>
                    {especialidades.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {especialidades.map((nombre: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] font-sans font-bold bg-blue-50 text-clinica-dark px-2 py-0.5 rounded-full"
                          >
                            {nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300 italic mt-0.5">Sin especialidades</p>
                    )}
                  </div>
                  <Link
                    href={"/dashboard/odontologos/" + o.id_odontologo}
                    className="flex items-center gap-1.5 text-xs font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Stethoscope size={14} />
                    Ver
                  </Link>
                </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
