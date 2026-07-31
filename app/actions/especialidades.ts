"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type EspecialidadState = { error: string } | { success: boolean } | null;

export type Especialidad = {
  id_especialidad: string;
  nombre: string;
  descripcion: string | null;
};

export async function crearEspecialidad(
  prevState: EspecialidadState,
  formData: FormData
): Promise<EspecialidadState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden crear especialidades." };
  }

  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return { error: "El nombre de la especialidad es obligatorio." };
  if (nombre.length < 3) return { error: "Mínimo 3 caracteres." };

  const descripcion = (formData.get("descripcion") as string)?.trim() || null;

  const { error } = await supabase
    .from("especialidad")
    .insert({ nombre, descripcion });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una especialidad con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/especialidades");
  return { success: true };
}

export async function editarEspecialidad(
  prevState: EspecialidadState,
  formData: FormData
): Promise<EspecialidadState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden editar especialidades." };
  }

  const id = formData.get("id_especialidad") as string;
  const nombre = (formData.get("nombre") as string)?.trim();

  if (!id || !nombre) return { error: "Todos los campos son obligatorios." };
  if (nombre.length < 3) return { error: "Mínimo 3 caracteres." };

  const descripcion = (formData.get("descripcion") as string)?.trim() || null;

  const { error } = await supabase
    .from("especialidad")
    .update({ nombre, descripcion })
    .eq("id_especialidad", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una especialidad con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/especialidades");
  return { success: true };
}

export async function eliminarEspecialidad(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || perfil.rol !== "admin") {
    return { error: "Solo administradores pueden eliminar especialidades." };
  }

  const { error } = await supabase
    .from("especialidad")
    .delete()
    .eq("id_especialidad", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/especialidades");
  return { success: true };
}

export async function asignarEspecialidadOdontologo(
  idOdontologo: string,
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
    return { error: "Solo administradores pueden asignar especialidades." };
  }

  const idEspecialidad = formData.get("id_especialidad");
  if (!idEspecialidad) return { error: "Selecciona una especialidad." };

  const { error } = await supabase
    .from("odontologosxespecialidad")
    .insert({ id_odontologo: idOdontologo, id_especialidad: idEspecialidad });

  if (error) {
    if (error.code === "23505") return { error: "El odontólogo ya tiene esta especialidad asignada." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/odontologos/" + idOdontologo);
  revalidatePath("/dashboard/odontologos/" + idOdontologo + "/especialidades");
  return { success: true };
}

export async function removerEspecialidadOdontologo(
  idOdontologo: string,
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
    return { error: "Solo administradores pueden remover especialidades." };
  }

  const idEspecialidad = formData.get("id_especialidad");
  if (!idEspecialidad) return { error: "Selecciona una especialidad." };

  const { error } = await supabase
    .from("odontologosxespecialidad")
    .delete()
    .eq("id_odontologo", idOdontologo)
    .eq("id_especialidad", idEspecialidad);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/odontologos/" + idOdontologo);
  revalidatePath("/dashboard/odontologos/" + idOdontologo + "/especialidades");
  return { success: true };
}
