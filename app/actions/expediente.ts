// app/actions/expediente.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type ExpedienteState = { error: string } | { success: boolean } | null;

/**
 * Crea o actualiza el expediente clínico general de un paciente.
 * Como la tabla no tiene una llave única sobre id_paciente, primero
 * verificamos si ya existe una fila para decidir si hacemos UPDATE
 * o INSERT.
 */
export async function guardarExpediente(
  prevState: ExpedienteState,
  formData: FormData
): Promise<ExpedienteState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_paciente = formData.get("id_paciente") as string;
  const medicamentos_actuales = (formData.get("medicamentos_actuales") as string)?.trim() || null;
  const observaciones = (formData.get("observaciones") as string)?.trim();

  if (!id_paciente) {
    return { error: "Falta el identificador del paciente." };
  }

  if (!observaciones) {
    return { error: "Las observaciones son obligatorias." };
  }

  const { data: existente } = await supabase
    .from("expediente")
    .select("id_expediente")
    .eq("id_paciente", id_paciente)
    .maybeSingle();

  let error;

  // Siempre "tocamos" actualizado_en, aunque el doctor no cambie
  // el texto — así se puede usar como confirmación de revisión.
  const actualizado_en = new Date().toISOString();

  if (existente) {
    ({ error } = await supabase
      .from("expediente")
      .update({ medicamentos_actuales, observaciones, actualizado_en })
      .eq("id_expediente", existente.id_expediente));
  } else {
    ({ error } = await supabase
      .from("expediente")
      .insert({ id_paciente, medicamentos_actuales, observaciones, actualizado_en }));
  }

  if (error) {
    return { error: "No se pudo guardar el expediente: " + error.message };
  }

  revalidatePath("/dashboard/pacientes/" + id_paciente + "/expediente");
  return { success: true };
}