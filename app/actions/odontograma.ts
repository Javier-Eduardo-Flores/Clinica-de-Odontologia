// app/actions/odontograma.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type OdontogramaState = { error: string } | { success: boolean } | null;

export async function actualizarOdontograma(
  prevState: OdontogramaState,
  formData: FormData
): Promise<OdontogramaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_paciente = formData.get("id_paciente") as string;
  const id_diente = formData.get("id_diente") as string;
  const id_estado_diente = formData.get("id_estado_diente") as string;
  const observaciones = (formData.get("observaciones") as string) || null;
  const id_consulta = (formData.get("id_consulta") as string) || null;

  if (!id_paciente || !id_diente || !id_estado_diente) {
    return { error: "Selecciona el diente y el nuevo estado." };
  }

  const { error } = await supabase.from("odontograma").insert({
    id_paciente,
    id_diente,
    id_estado_diente,
    observaciones,
    id_consulta,
  });

  if (error) {
    return { error: "No se pudo actualizar el odontograma: " + error.message };
  }

  revalidatePath("/dashboard/pacientes/" + id_paciente + "/odontograma");
  return { success: true };
}