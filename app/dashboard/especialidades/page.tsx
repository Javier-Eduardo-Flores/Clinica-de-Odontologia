import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default async function EspecialidadesPage({
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

  if (!perfil || perfil.rol !== "admin") {
    redirect("/dashboard");
  }

  let query = supabase
    .from("especialidad")
    .select("id_especialidad, nombre, descripcion")
    .order("nombre", { ascending: true });

  if (q && q.trim().length > 0) {
    query = query.ilike("nombre", `%${q}%`);
  }

  const { data: especialidades } = await query;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/especialidades" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <span>&larr; Volver al Dashboard</span>
          </Link>
          <form action="/dashboard/especialidades" method="GET" className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar especialidad..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </form>
        </header>

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-sans font-bold text-gray-900">Especialidades</h1>
            <Link
              href="/dashboard/especialidades/nuevo"
              className="flex items-center gap-1.5 text-sm font-sans font-semibold text-white bg-clinica-dark px-4 py-2 rounded-lg hover:bg-clinica-medium transition-colors"
            >
              <Plus size={16} />
              Nueva Especialidad
            </Link>
          </div>

          {!especialidades || especialidades.length === 0 ? (
            <p className="text-gray-400 font-sans">No se encontraron especialidades.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-4 px-6">Nombre</th>
                    <th className="py-4 px-6">Descripción</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {especialidades.map((e) => (
                    <tr key={e.id_especialidad} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-6 font-sans font-semibold text-gray-900">{e.nombre}</td>
                      <td className="py-4 px-6 text-sm font-sans text-gray-500 max-w-md truncate">
                        {e.descripcion || <span className="italic text-gray-300">Sin descripción</span>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/especialidades/${e.id_especialidad}/editar`}
                            className="flex items-center gap-1 text-xs font-sans font-semibold text-clinica-dark border border-clinica-dark px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={12} />
                            Editar
                          </Link>
                          <Link
                            href={`/dashboard/especialidades/${e.id_especialidad}/eliminar`}
                            className="flex items-center gap-1 text-xs font-sans font-semibold text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                            Eliminar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
