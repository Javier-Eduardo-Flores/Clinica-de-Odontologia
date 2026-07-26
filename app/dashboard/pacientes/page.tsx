// app/dashboard/pacientes/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { Search, ArrowLeft, Smile } from "lucide-react";

export default async function PacientesPage({
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

  if (!perfil || !["admin", "doctor", "recepcionista"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  let query = supabase
    .from("pacientes")
    .select("id_paciente, primer_nombre, primer_apellido, correo, dni")
    .order("primer_nombre", { ascending: true })
    .limit(30);

  if (q && q.trim().length > 0) {
    query = query.or(
      "primer_nombre.ilike.%" + q + "%,primer_apellido.ilike.%" + q + "%,correo.ilike.%" + q + "%,dni.ilike.%" + q + "%"
    );
  }

  const { data: pacientes } = await query;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/pacientes" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-sans font-semibold text-gray-500 hover:text-clinica-dark"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
          <form action="/dashboard/pacientes" method="GET" className="relative flex-1 max-w-xl">
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
          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-6">Pacientes</h1>

          {!pacientes || pacientes.length === 0 ? (
            <p className="text-gray-400 font-sans">No se encontraron pacientes.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {pacientes.map((p) => (
                <Link
                  key={p.id_paciente}
                  href={"/dashboard/pacientes/" + p.id_paciente + "/odontograma"}
                  className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:border-clinica-dark border border-transparent transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-clinica-light flex items-center justify-center font-sans font-bold text-clinica-dark shrink-0">
                    {p.primer_nombre?.[0]}{p.primer_apellido?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-sans font-semibold text-gray-900 text-sm">
                      {p.primer_nombre} {p.primer_apellido}
                    </p>
                    <p className="text-xs text-gray-400">{p.correo}</p>
                  </div>
                  <Smile size={18} className="text-gray-300" />
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}