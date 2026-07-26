// app/dashboard/citas/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/sidebar";
import { Calendar, Clock } from "lucide-react";

const ESTADOS = [
  { value: "2", label: "Confirmadas" },
  { value: "1", label: "Pendientes" },
  { value: "4", label: "Completadas" },
  { value: "3", label: "Canceladas" },
];

const ESTADO_BADGE: Record<string, string> = {
  "1": "bg-amber-50 text-amber-700",
  "2": "bg-green-50 text-green-700",
  "3": "bg-red-50 text-red-700",
  "4": "bg-blue-50 text-clinica-dark",
};

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const estadoActivo = estado ?? "2";

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

  const { data: citas } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, estado, pacientes!fk_id_usuario(id_paciente, primer_nombre, primer_apellido)")
    .eq("estado", Number(estadoActivo))
    .order("fecha_cita", { ascending: estadoActivo !== "4" })
    .limit(50);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/citas" />

      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-sans font-bold text-gray-900">Citas</h1>
        </header>

        <main className="p-8">
          <div className="flex items-center gap-2 mb-6">
            {ESTADOS.map((e) => (
              <Link
                key={e.value}
                href={"/dashboard/citas?estado=" + e.value}
                className={
                  "px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-colors " +
                  (estadoActivo === e.value
                    ? "bg-clinica-dark text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")
                }
              >
                {e.label}
              </Link>
            ))}
          </div>

          {!citas || citas.length === 0 ? (
            <p className="text-gray-400 font-sans">No hay citas en este estado.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-3 px-6">Paciente</th>
                    <th className="py-3 px-6">Motivo</th>
                    <th className="py-3 px-6">Fecha</th>
                    <th className="py-3 px-6">Estado</th>
                    <th className="py-3 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => (
                    <tr key={c.id_cita} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 px-6 font-sans font-semibold text-gray-900">
                        {c.pacientes?.[0]?.primer_nombre} {c.pacientes?.[0]?.primer_apellido}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-sans text-sm">{c.motivo}</td>
                      <td className="py-4 px-6 text-gray-600 font-sans text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {new Date(c.fecha_cita).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={13} />
                          {new Date(c.fecha_cita).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={"text-[10px] font-sans font-bold px-2 py-0.5 rounded-full " + (ESTADO_BADGE[String(c.estado)] ?? "bg-gray-100 text-gray-600")}>
                          {ESTADOS.find((e) => e.value === String(c.estado))?.label ?? c.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={"/dashboard/citas/" + c.id_cita}
                          className="text-clinica-dark font-sans font-semibold text-xs hover:underline"
                        >
                          Ver detalle
                        </Link>
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