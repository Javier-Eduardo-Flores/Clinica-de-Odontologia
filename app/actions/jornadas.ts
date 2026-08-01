"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type JornadaState = { error: string } | { success: boolean } | null;

export type Jornada = {
  id_jornada: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
};

export async function crearJornada(
  prevState: JornadaState,
  formData: FormData
): Promise<JornadaState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden crear jornadas." };
  }

  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return { error: "El nombre de la jornada es obligatorio." };
  if (nombre.length < 3) return { error: "Mínimo 3 caracteres." };

  const horaInicio = (formData.get("hora_inicio") as string)?.trim();
  const horaFin = (formData.get("hora_fin") as string)?.trim();
  if (!horaInicio || !horaFin) {
    return { error: "La hora de inicio y de fin son obligatorias." };
  }
  if (horaInicio >= horaFin) {
    return { error: "La hora de fin debe ser posterior a la hora de inicio." };
  }

  const { error } = await supabase
    .from("jornadas")
    .insert({ nombre, hora_inicio: horaInicio, hora_fin: horaFin });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una jornada con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/jornadas");
  return { success: true };
}

export async function editarJornada(
  prevState: JornadaState,
  formData: FormData
): Promise<JornadaState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden editar jornadas." };
  }

  const id = formData.get("id_jornada") as string;
  const nombre = (formData.get("nombre") as string)?.trim();

  if (!id || !nombre) return { error: "Todos los campos son obligatorios." };
  if (nombre.length < 3) return { error: "Mínimo 3 caracteres." };

  const horaInicio = (formData.get("hora_inicio") as string)?.trim();
  const horaFin = (formData.get("hora_fin") as string)?.trim();
  if (!horaInicio || !horaFin) {
    return { error: "La hora de inicio y de fin son obligatorias." };
  }
  if (horaInicio >= horaFin) {
    return { error: "La hora de fin debe ser posterior a la hora de inicio." };
  }

  const { error } = await supabase
    .from("jornadas")
    .update({ nombre, hora_inicio: horaInicio, hora_fin: horaFin })
    .eq("id_jornada", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una jornada con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/jornadas");
  return { success: true };
}

export async function eliminarJornada(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden eliminar jornadas." };
  }

  const { error } = await supabase
    .from("jornadas")
    .delete()
    .eq("id_jornada", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "No se puede eliminar: la jornada está asignada a uno o más odontólogos." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/jornadas");
  return { success: true };
}

export async function asignarJornadaOdontologo(
  idOdontologo: string,
  diaSemana: number,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden asignar horarios." };
  }

  const idJornada = formData.get("id_jornada");
  if (!idJornada) return { error: "Selecciona una jornada." };

  const { error } = await supabase
    .from("odontologos_jornadas")
    .upsert(
      { id_odontologo: idOdontologo, id_jornada: idJornada, dia_semana: diaSemana },
      { onConflict: "id_odontologo,dia_semana" }
    );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/odontologos/" + idOdontologo);
  revalidatePath("/dashboard/odontologos/" + idOdontologo + "/horario");
  return { success: true };
}

export async function removerJornadaOdontologo(idOdontologo: string, diaSemana: number) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden modificar horarios." };
  }

  const { error } = await supabase
    .from("odontologos_jornadas")
    .delete()
    .eq("id_odontologo", idOdontologo)
    .eq("dia_semana", diaSemana);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/odontologos/" + idOdontologo);
  revalidatePath("/dashboard/odontologos/" + idOdontologo + "/horario");
  return { success: true };
}
