// app/actions/citas.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { obtenerHorasDisponibles } from "@/app/actions/horarios";

export type CitaState = { error: string } | { success: boolean } | null;

/**
 * Crea una nueva cita para el paciente autenticado.
 * Valida disponibilidad del doctor (±30 min) y que el usuario no se duplique.
 */
export async function agendarCita(prevState: CitaState, formData: FormData): Promise<CitaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fecha = formData.get("fecha") as string;
  const hora = formData.get("hora") as string;
  const id_tratamiento = formData.get("id_tratamiento") as string;
  const id_odontologo = formData.get("id_odontologo") as string;

  if (!fecha || !hora || !id_tratamiento || !id_odontologo) {
    return { error: "Completa todos los campos, incluyendo el odontólogo." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  const fechaIso = fechaCita.toISOString();

  // 1. VALIDACIÓN: El usuario no puede tener otra cita a la misma hora exacta (Estados 1: Pendiente, 2: Confirmada)
  const { data: citasUsuario } = await supabase
    .from("citas")
    .select("id_cita")
    .eq("id_usuario", user.id)
    .in("estado", [1, 2])
    .eq("fecha_cita", fechaIso);

  if (citasUsuario && citasUsuario.length > 0) {
    return { error: "Ya tienes una cita agendada para esta misma fecha y hora." };
  }

  // 2. VALIDACIÓN: la hora debe estar dentro de la jornada del odontólogo ese día,
  //    y respetar al menos 30 minutos de diferencia con sus otras citas.
  const disponibilidad = await obtenerHorasDisponibles(id_odontologo, fecha);

  if ("error" in disponibilidad) {
    return { error: disponibilidad.error };
  }
  if (!disponibilidad.atiende) {
    return { error: disponibilidad.mensaje || "El odontólogo no atiende ese día." };
  }
  if (!disponibilidad.horas.includes(hora)) {
    return {
      error: "Esa hora no está disponible: está fuera de la jornada del odontólogo o ya está ocupada (debe haber al menos 30 min de diferencia).",
    };
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
    fecha_cita: fechaIso,
    motivo: tratamiento.nombre,
    id_tratamiento,
    id_odontologo,
    estado: 1, // Pendiente
  });

  if (error) {
    return { error: "No se pudo agendar la cita: " + error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Agenda una cita en nombre de un paciente. Solo admin y recepcionista pueden usarla.
 */
export async function agendarCitaStaff(prevState: CitaState, formData: FormData): Promise<CitaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || !["admin", "recepcionista"].includes(perfil.rol)) {
    return { error: "No tienes permiso para agendar citas a nombre de un paciente." };
  }

  const id_paciente = formData.get("id_paciente") as string;
  const fecha = formData.get("fecha") as string;
  const hora = formData.get("hora") as string;
  const id_tratamiento = formData.get("id_tratamiento") as string;
  const id_odontologo = formData.get("id_odontologo") as string;

  if (!id_paciente || !fecha || !hora || !id_tratamiento || !id_odontologo) {
    return { error: "Completa todos los campos, incluyendo el paciente y el odontólogo." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  const fechaIso = fechaCita.toISOString();

  // 1. VALIDACIÓN: el paciente no puede tener otra cita a la misma hora exacta.
  const { data: citasPaciente } = await supabase
    .from("citas")
    .select("id_cita")
    .eq("id_usuario", id_paciente)
    .in("estado", [1, 2])
    .eq("fecha_cita", fechaIso);

  if (citasPaciente && citasPaciente.length > 0) {
    return { error: "El paciente ya tiene una cita agendada para esta misma fecha y hora." };
  }

  // 2. VALIDACIÓN: la hora debe estar dentro de la jornada del odontólogo ese día,
  //    y respetar al menos 30 minutos de diferencia con sus otras citas.
  const disponibilidad = await obtenerHorasDisponibles(id_odontologo, fecha);

  if ("error" in disponibilidad) {
    return { error: disponibilidad.error };
  }
  if (!disponibilidad.atiende) {
    return { error: disponibilidad.mensaje || "El odontólogo no atiende ese día." };
  }
  if (!disponibilidad.horas.includes(hora)) {
    return {
      error: "Esa hora no está disponible: está fuera de la jornada del odontólogo o ya está ocupada (debe haber al menos 30 min de diferencia).",
    };
  }

  const { data: tratamiento } = await supabase
    .from("tratamiento")
    .select("nombre")
    .eq("id_tratamiento", id_tratamiento)
    .maybeSingle();

  if (!tratamiento) {
    return { error: "Selecciona un tratamiento válido." };
  }

  const { error } = await createAdminClient().from("citas").insert({
    id_usuario: id_paciente,
    fecha_cita: fechaIso,
    motivo: tratamiento.nombre,
    id_tratamiento,
    id_odontologo,
    estado: 1, // Pendiente
  });

  if (error) {
    return { error: "No se pudo agendar la cita: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/citas");
  redirect("/dashboard/citas");
}

/**
 * Confirma una cita PENDIENTE (usado por doctor/recepcionista/admin).
 */
export async function confirmarCitaStaff(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id_cita = formData.get("id_cita") as string;
  if (!id_cita) return;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  if (!perfil || !["admin", "doctor", "recepcionista"].includes(perfil.rol)) {
    return;
  }

  // Si es doctor, solo puede confirmar la cita si es el odontólogo asignado.
  if (perfil.rol === "doctor") {
    const { data: cita } = await supabase
      .from("citas")
      .select("id_odontologo")
      .eq("id_cita", id_cita)
      .maybeSingle();

    if (!cita || cita.id_odontologo !== user.id) {
      console.error("Un doctor intentó confirmar una cita que no tiene asignada.");
      return;
    }
  }

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
  const id_odontologo = formData.get("id_odontologo") as string;

  if (!id_cita || !fecha || !hora || !id_tratamiento || !id_odontologo) {
    return { error: "Completa todos los campos." };
  }

  const fechaCita = new Date(`${fecha}T${hora}:00`);

  if (isNaN(fechaCita.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  if (fechaCita.getTime() <= Date.now()) {
    return { error: "Elige una fecha y hora futura." };
  }

  const fechaIso = fechaCita.toISOString();

  // 1. VALIDACIÓN USUARIO (excluyendo la cita actual que estamos editando)
  const { data: citasUsuario } = await supabase
    .from("citas")
    .select("id_cita")
    .eq("id_usuario", user.id)
    .in("estado", [1, 2])
    .eq("fecha_cita", fechaIso)
    .neq("id_cita", id_cita);

  if (citasUsuario && citasUsuario.length > 0) {
    return { error: "Ya tienes otra cita agendada para esta misma fecha y hora." };
  }

  // 2. VALIDACIÓN: la hora debe estar dentro de la jornada del odontólogo ese día,
  //    y respetar al menos 30 minutos de diferencia con sus otras citas (excluyendo esta misma).
  const disponibilidad = await obtenerHorasDisponibles(id_odontologo, fecha, id_cita);

  if ("error" in disponibilidad) {
    return { error: disponibilidad.error };
  }
  if (!disponibilidad.atiende) {
    return { error: disponibilidad.mensaje || "El odontólogo no atiende ese día." };
  }
  if (!disponibilidad.horas.includes(hora)) {
    return {
      error: "Esa hora no está disponible: está fuera de la jornada del odontólogo o ya está ocupada (debe haber al menos 30 min de diferencia).",
    };
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
      fecha_cita: fechaIso,
      motivo: tratamiento.nombre,
      id_tratamiento,
      id_odontologo,
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
 * Marca una cita como completada, crea la consulta médica y genera automáticamente 
 * la factura con su numeración correlativa y 15% ISV.
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

  // 1. Obtener los datos de la cita
  const { data: cita, error: errorCitaInfo } = await supabase
    .from("citas")
    .select("id_usuario, id_tratamiento")
    .eq("id_cita", id_cita)
    .maybeSingle();

  if (errorCitaInfo || !cita) {
    return { error: "No se encontró la cita." };
  }

  // 2. Insertar la consulta
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

  // 3. Crear el detalle de la consulta y la factura asociada
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
      const tipoDocumento = "01";
      const fechaFinal = new Date().toISOString().slice(0, 10);

      // Generar correlativo (Formato: 000-001-01-XXXXXXX)
      const prefix = `000-001-${tipoDocumento}-`;
      const { data: lastInvoice } = await supabase
        .from("factura")
        .select("no_factura")
        .like("no_factura", `${prefix}%`)
        .order("no_factura", { ascending: false })
        .limit(1);

      let nextCorr = 1;
      if (lastInvoice?.[0]?.no_factura) {
        const lastNum = parseInt(lastInvoice[0].no_factura.slice(-8), 10);
        if (!isNaN(lastNum)) nextCorr = lastNum + 1;
      }

      const noFactura = `${prefix}${String(nextCorr).padStart(8, "0")}`;

      // Insertar la factura
      const { data: factura, error: errFactura } = await supabase
        .from("factura")
        .insert({
          id_paciente: cita.id_usuario,
          fecha: fechaFinal,
          subtotal,
          impuestos,
          tipo_documento: tipoDocumento,
          no_factura: noFactura,
          estado: 1, // 1 = Pendiente
        })
        .select("id_factura")
        .single();

      if (errFactura) {
        console.error("Error al crear la factura:", errFactura.message);
      } else if (factura) {
        // Insertar el detalle de la factura
        const { error: errDetalle } = await supabase.from("detalle_factura").insert({
          id_factura: factura.id_factura,
          id_tratamiento: cita.id_tratamiento,
          cantidad: 1,
          precio_unitario: subtotal,
          monto_descuento: 0,
        });

        if (errDetalle) {
          console.error("Error al insertar detalle de factura:", errDetalle.message);
        }
      }
    }
  }

  // 4. Cambiar estado de la cita a Completada (4)
  const { error: errorCita } = await supabase
    .from("citas")
    .update({ estado: 4 })
    .eq("id_cita", id_cita);

  if (errorCita) {
    return {
      error:
        "La consulta se creó, pero no se pudo actualizar el estado de la cita: " +
        errorCita.message,
    };
  }

  // 5. Revalidar y redireccionar
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/citas");
  revalidatePath("/dashboard/facturacion");
  redirect("/dashboard/citas");
}