// app/actions/citas.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type CitaState = { error: string } | { success: boolean } | null;

/**
 * Crea una nueva cita para el paciente autenticado.
 * Combina fecha + hora en un solo timestamp y valida que sea futura.
 */
export async function agendarCita(prevState: CitaState, formData: FormData): Promise<CitaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fecha = formData.get("fecha") as string; // "2026-08-15"
  const hora = formData.get("hora") as string;   // "10:30"
  const motivo = formData.get("motivo") as string;

  if (!fecha || !hora || !motivo) {
    return { error: "Completa todos los campos." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  if (motivo.trim().length < 5) {
    return { error: "Describe brevemente el motivo de tu cita (mínimo 5 caracteres)." };
  }

  const { error } = await supabase.from("citas").insert({
    id_usuario: user.id,
    fecha_cita: fechaCita.toISOString(),
    motivo: motivo.trim(),
    estado: 1, // Pendiente
  });

  if (error) {
    return { error: "No se pudo agendar la cita: " + error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Confirma una cita PENDIENTE (usado por doctor/recepcionista/admin
 * desde su dashboard). No valida dueño, pero la política RLS de
 * UPDATE en `citas` solo debe permitir esto a personal clínico.
 */
export async function confirmarCitaStaff(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_cita = formData.get("id_cita") as string;
  if (!id_cita) return;

  const { error } = await supabase
    .from("citas")
    .update({ estado: 2 }) // Confirmada
    .eq("id_cita", id_cita);

  if (error) {
    console.error("Error al confirmar cita:", error.message);
    return;
  }

  revalidatePath("/dashboard");
}

/**
 * Modifica fecha, hora y motivo de una cita existente.
 * El paciente solo puede editar su propia cita mientras esté
 * PENDIENTE (lo aplica la política RLS). El personal clínico puede
 * editar cualquier cita.
 */
export async function modificarCita(prevState: CitaState, formData: FormData): Promise<CitaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_cita = formData.get("id_cita") as string;
  const fecha = formData.get("fecha") as string;
  const hora = formData.get("hora") as string;
  const motivo = formData.get("motivo") as string;

  if (!id_cita || !fecha || !hora || !motivo) {
    return { error: "Completa todos los campos." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  if (motivo.trim().length < 5) {
    return { error: "Describe brevemente el motivo (mínimo 5 caracteres)." };
  }

  const { error } = await supabase
    .from("citas")
    .update({ fecha_cita: fechaCita.toISOString(), motivo: motivo.trim() })
    .eq("id_cita", id_cita);

  if (error) {
    return { error: "No se pudo modificar la cita: " + error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}