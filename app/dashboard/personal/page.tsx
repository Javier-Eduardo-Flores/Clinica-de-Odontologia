// app/dashboard/personal/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { Search, Mail, Phone, UserPlus, Edit, Trash2 } from "lucide-react";

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  doctor: "Odontólogo",
  recepcionista: "Recepcionista",
};

const ROL_BADGE: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700",
  doctor: "bg-blue-50 text-clinica-dark",
  recepcionista: "bg-amber-50 text-amber-700",
};

export default async function PersonalPage({
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

  const esAdmin = perfil.rol === "admin";

  let query = supabase
    .from("profiles")
    .select("id_profile, nombre, apellido, email, telefono, rol")
    .in("rol", ["admin", "doctor", "recepcionista"])
    .order("rol", { ascending: true })
    .order("nombre", { ascending: true });

  if (q && q.trim().length > 0) {
    query = query.or(
      "nombre.ilike.%" + q + "%,apellido.ilike.%" + q + "%,email.ilike.%" + q + "%"
    );
  }

  const { data: personal } = await query;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/personal" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
          <form action="/dashboard/personal" method="GET" className="relative flex-1 max-w-xl">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre, apellido o correo..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </form>
        </header>

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-sans font-bold text-gray-900">Personal</h1>
            {esAdmin && (
              <Link
                href="/dashboard/personal/nuevo"
                className="flex items-center gap-1.5 text-sm font-sans font-semibold text-white bg-clinica-dark px-4 py-2 rounded-lg hover:bg-clinica-medium transition-colors"
              >
                <UserPlus size={16} />
                Nuevo Recepcionista
              </Link>
            )}
          </div>

          {!personal || personal.length === 0 ? (
            <p className="text-gray-400 font-sans">No se encontró personal.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {personal.map((p) => (
                <div key={p.id_profile} className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-clinica-light flex items-center justify-center font-sans font-bold text-clinica-dark shrink-0">
                    {p.nombre?.[0]}{p.apellido?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-sans font-semibold text-gray-900 text-sm">
                        {p.nombre} {p.apellido}
                      </p>
                      <span className={"text-[10px] font-sans font-bold px-2 py-0.5 rounded-full " + (ROL_BADGE[p.rol] ?? "bg-gray-100 text-gray-600")}>
                        {ROL_LABEL[p.rol] ?? p.rol}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans mt-2">
                      <Mail size={12} /> {p.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans mt-1">
                      <Phone size={12} /> {p.telefono}
                    </div>
                  </div>
                  {esAdmin && p.rol === "recepcionista" && (
                    <div className="flex flex-col gap-1.5 ml-2">
                      <Link
                        href={`/dashboard/personal/${p.id_profile}/editar`}
                        className="flex items-center gap-1 text-xs font-sans font-semibold text-clinica-dark border border-clinica-dark px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit size={12} />
                        Editar
                      </Link>
                      <Link
                        href={`/dashboard/personal/${p.id_profile}/eliminar`}
                        className="flex items-center gap-1 text-xs font-sans font-semibold text-red-600 border border-red-300 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                        Eliminar
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}