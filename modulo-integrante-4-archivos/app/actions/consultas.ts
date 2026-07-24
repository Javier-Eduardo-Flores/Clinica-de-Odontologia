"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ConsultaState = { error: string } | { success: boolean; id_consulta?: string } | null;

/* ==================================================================
   EXPEDIENTE
================================================================== */

export type Expediente = {
  id_expediente: string;
  id_paciente: string;
  alergias: string | null;
  patologias_previas: string | null;
  medicacion_habitual: string | null;
  notas_generales: string | null;
  fecha_actualizacion: string;
} | null;

/** Obtiene el expediente de un paciente. Devuelve null si aún no existe. */
export async function obtenerExpediente(idPaciente: string): Promise<Expediente> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expediente")
    .select(
      "id_expediente, id_paciente, alergias, patologias_previas, medicacion_habitual, notas_generales, fecha_actualizacion"
    )
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Crea o actualiza el expediente de un paciente (solo admin/doctor por RLS). */
export async function guardarExpediente(prevState: ConsultaState, formData: FormData): Promise<ConsultaState> {
  const supabase = await createClient();

  const id_paciente = formData.get("id_paciente") as string;
  const alergias = (formData.get("alergias") as string) || null;
  const patologias_previas = (formData.get("patologias_previas") as string) || null;
  const medicacion_habitual = (formData.get("medicacion_habitual") as string) || null;
  const notas_generales = (formData.get("notas_generales") as string) || null;

  if (!id_paciente) {
    return { error: "Falta el identificador del paciente" };
  }

  const { error } = await supabase
    .from("expediente")
    .upsert(
      { id_paciente, alergias, patologias_previas, medicacion_habitual, notas_generales },
      { onConflict: "id_paciente" }
    );

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/pacientes/${id_paciente}`);
  revalidatePath("/dashboard/expediente");
  return { success: true };
}

/* ==================================================================
   CONSULTAS — LECTURA
================================================================== */

export type ConsultaHistorial = {
  id_consulta: string;
  fecha: string;
  diagnostico: string | null;
  evolucion: string | null;
  doctor: string;
  tratamientos: { nombre: string; cantidad: number }[];
};

type ConsultaHistorialRow = {
  id_consulta: string;
  fecha: string;
  diagnostico: string | null;
  evolucion: string | null;
  odontologos: { primer_nombre: string; primer_apellido: string } | null;
  detalle_consultas: { cantidad: number; tratamiento: { nombre: string } | null }[] | null;
};

/** Historial de consultas de un paciente (para /dashboard/expediente). */
export async function obtenerHistorialConsultas(idPaciente: string): Promise<ConsultaHistorial[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("consultas")
    .select(
      `id_consulta,
       fecha,
       diagnostico,
       evolucion,
       citas!inner ( id_usuario ),
       odontologos ( primer_nombre, primer_apellido ),
       detalle_consultas ( cantidad, tratamiento ( nombre ) )`
    )
    .eq("citas.id_usuario", idPaciente)
    .order("fecha", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as ConsultaHistorialRow[]).map((c) => ({
    id_consulta: c.id_consulta,
    fecha: c.fecha,
    diagnostico: c.diagnostico,
    evolucion: c.evolucion,
    doctor: c.odontologos
      ? `Dr(a). ${c.odontologos.primer_nombre} ${c.odontologos.primer_apellido}`
      : "Sin asignar",
    tratamientos: (c.detalle_consultas ?? [])
      .filter((d) => d.tratamiento)
      .map((d) => ({ nombre: d.tratamiento!.nombre, cantidad: d.cantidad })),
  }));
}

/** Detalle completo de una sola consulta (para /dashboard/expediente/[id]). */
export async function obtenerConsultaDetalle(idConsulta: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("consultas")
    .select(
      `id_consulta,
       fecha,
       diagnostico,
       evolucion,
       citas ( id_usuario, motivo ),
       odontologos ( primer_nombre, primer_apellido ),
       detalle_consultas ( id_detalle_consulta, cantidad, notas, tratamiento ( nombre, precio ) )`
    )
    .eq("id_consulta", idConsulta)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type CitaParaConsulta = {
  id_cita: string;
  fecha_cita: string;
  motivo: string | null;
  paciente_nombre: string;
};

/**
 * Citas del odontólogo autenticado que aún no tienen consulta registrada
 * (para el selector en /dashboard/consultas/nueva).
 */
export async function obtenerCitasSinConsulta(): Promise<CitaParaConsulta[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("citas")
    .select("id_cita, fecha_cita, motivo, profiles ( nombre, apellido ), consultas ( id_consulta )")
    .eq("id_odontologo", user.id)
    .order("fecha_cita", { ascending: false })
    .limit(50);

  if (error) throw error;

  type Fila = {
    id_cita: string;
    fecha_cita: string;
    motivo: string | null;
    profiles: { nombre: string; apellido: string } | null;
    consultas: { id_consulta: string }[] | null;
  };

  return ((data ?? []) as unknown as Fila[])
    .filter((c) => !c.consultas || c.consultas.length === 0)
    .map((c) => ({
      id_cita: c.id_cita,
      fecha_cita: c.fecha_cita,
      motivo: c.motivo,
      paciente_nombre: c.profiles ? `${c.profiles.nombre} ${c.profiles.apellido}` : "Paciente",
    }));
}

/* ==================================================================
   CONSULTAS — ESCRITURA (transaccional vía RPC)
================================================================== */

/**
 * Registra la atención de una consulta: 1 fila en `consultas` + N filas
 * en `detalle_consultas`, de forma atómica (función RPC
 * `registrar_consulta` en Supabase — ver supabase/expediente_consultas_schema.sql).
 *
 * Espera en formData:
 *  - id_cita
 *  - diagnostico
 *  - evolucion
 *  - tratamientos: JSON string de [{ id_tratamiento, cantidad, notas }]
 */
export async function registrarConsulta(prevState: ConsultaState, formData: FormData): Promise<ConsultaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión" };

  const id_cita = formData.get("id_cita") as string;
  const diagnostico = (formData.get("diagnostico") as string) || null;
  const evolucion = (formData.get("evolucion") as string) || null;
  const tratamientosRaw = formData.get("tratamientos") as string;

  if (!id_cita) return { error: "Selecciona la cita asociada" };
  if (!tratamientosRaw) return { error: "Agrega al menos un tratamiento" };

  let tratamientos: { id_tratamiento: string; cantidad: number; notas?: string }[];
  try {
    tratamientos = JSON.parse(tratamientosRaw);
  } catch {
    return { error: "Formato inválido de tratamientos" };
  }

  if (!Array.isArray(tratamientos) || tratamientos.length === 0) {
    return { error: "Agrega al menos un tratamiento" };
  }
  for (const t of tratamientos) {
    if (!t.id_tratamiento || !t.cantidad || t.cantidad <= 0) {
      return { error: "Cada tratamiento debe tener un servicio y una cantidad válida" };
    }
  }

  const { data, error } = await supabase.rpc("registrar_consulta", {
    p_id_cita: id_cita,
    p_id_odontologo: user.id,
    p_diagnostico: diagnostico,
    p_evolucion: evolucion,
    p_tratamientos: tratamientos,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/expediente");
  revalidatePath("/dashboard/consultas/nueva");
  return { success: true, id_consulta: data as string };
}
