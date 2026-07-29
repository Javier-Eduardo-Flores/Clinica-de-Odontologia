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
  const id_tratamiento = formData.get("id_tratamiento") as string;
  const id_odontologo = formData.get("id_odontologo") as string; // 👈 ¡Agregado aquí!

  if (!fecha || !hora || !id_tratamiento || !id_odontologo) { // 👈 ¡Incluido en la validación!
    return { error: "Completa todos los campos, incluyendo el odontólogo." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  const { data: tratamiento } = await supabase
    .from("tratamiento")
    .select("nombre")
    .eq("id_tratamiento", id_tratamiento)
    .maybeSingle();

  if (!tratamiento) {
    return { error: "Selecciona un tratamiento válido." };
  }

  const { error } = await supabase.from("citas").insert({
    id_usuario: user.id,
    fecha_cita: fechaCita.toISOString(),
    motivo: tratamiento.nombre,
    id_tratamiento,
    id_odontologo, // 👈 ¡Enviado a Supabase!
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
 * Modifica fecha, hora, tratamiento y odontólogo de una cita existente.
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
  const id_tratamiento = formData.get("id_tratamiento") as string;
  const id_odontologo = formData.get("id_odontologo") as string; // 👈 ¡Agregado aquí también!

  if (!id_cita || !fecha || !hora || !id_tratamiento || !id_odontologo) { // 👈 ¡Incluido aquí!
    return { error: "Completa todos los campos." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  const { data: tratamiento } = await supabase
    .from("tratamiento")
    .select("nombre")
    .eq("id_tratamiento", id_tratamiento)
    .maybeSingle();

  if (!tratamiento) {
    return { error: "Selecciona un tratamiento válido." };
  }

  const { error } = await supabase
    .from("citas")
    .update({
      fecha_cita: fechaCita.toISOString(),
      motivo: tratamiento.nombre,
      id_tratamiento,
      id_odontologo, // 👈 ¡Actualizado en Supabase!
    })
    .eq("id_cita", id_cita);

  if (error) {
    return { error: "No se pudo modificar la cita: " + error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Cancela una cita (usado por el staff desde el detalle de la cita).
 */
export async function cancelarCitaStaff(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_cita = formData.get("id_cita") as string;
  if (!id_cita) return;

  const { error } = await supabase
    .from("citas")
    .update({ estado: 3 }) // Cancelada
    .eq("id_cita", id_cita);

  if (error) {
    console.error("Error al cancelar cita:", error.message);
    return;
  }

  revalidatePath("/dashboard/citas");
  redirect("/dashboard/citas");
}

export type CompletarCitaState = { error: string } | null;

/**
 * Marca una cita como completada Y crea la consulta asociada con el
 * diagnóstico. Solo el odontólogo que la atendió puede hacer esto
 * (id_odontologo = su propio uid, exigido también por RLS).
 */
export async function completarCitaConConsulta(
  prevState: CompletarCitaState,
  formData: FormData
): Promise<CompletarCitaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_cita = formData.get("id_cita") as string;
  const diagnostico = (formData.get("diagnostico") as string)?.trim();
  const observaciones = (formData.get("observaciones") as string)?.trim() || null;

  if (!id_cita || !diagnostico) {
    return { error: "El diagnóstico es obligatorio." };
  }

  const { data: cita, error: errorCitaInfo } = await supabase
    .from("citas")
    .select("id_usuario, id_tratamiento")
    .eq("id_cita", id_cita)
    .maybeSingle();

  if (errorCitaInfo || !cita) {
    return { error: "No se encontró la cita." };
  }

  const { data: consulta, error: errorConsulta } = await supabase
    .from("consultas")
    .insert({
      id_cita,
      id_odontologo: user.id,
      diagnostico,
      observaciones,
    })
    .select("id_consulta")
    .single();

  if (errorConsulta || !consulta) {
    return { error: "No se pudo crear la consulta: " + (errorConsulta?.message ?? "") };
  }

  if (cita.id_tratamiento) {
    await supabase.from("detalle_consultas").insert({
      id_consulta: consulta.id_consulta,
      id_tratamiento: cita.id_tratamiento,
      cantidad: 1,
    });

    const { data: tratamiento } = await supabase
      .from("tratamiento")
      .select("precio")
      .eq("id_tratamiento", cita.id_tratamiento)
      .maybeSingle();

    if (tratamiento) {
      const subtotal = Number(tratamiento.precio);
      const impuestos = Number((subtotal * 0.15).toFixed(2));
      const total = Number((subtotal + impuestos).toFixed(2));

      const { data: factura } = await supabase
        .from("factura")
        .insert({
          id_paciente: cita.id_usuario,
          subtotal,
          impuestos,
          total,
        })
        .select("id_factura")
        .single();

      if (factura) {
        await supabase.from("detalle_factura").insert({
          id_factura: factura.id_factura,
          id_tratamiento: cita.id_tratamiento,
          cantidad: 1,
          precio_unitario: subtotal,
        });
      }
    }
  }

  const { error: errorCita } = await supabase
    .from("citas")
    .update({ estado: 4 }) // Completada
    .eq("id_cita", id_cita);

  if (errorCita) {
    return { error: "La consulta se creó, pero no se pudo actualizar el estado de la cita: " + errorCita.message };
  }

  revalidatePath("/dashboard/citas");
  redirect("/dashboard/citas");
}  