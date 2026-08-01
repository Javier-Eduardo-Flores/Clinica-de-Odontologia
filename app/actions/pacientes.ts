"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateApellido,
  validateDNI,
  validateTelefono,
  validateFechaNacimiento,
  validateDireccion,
  validateGenero,
} from "@/utils/validations";

export type PacienteState = { error: string } | { success: boolean } | null;

export type Paciente = {
  id_paciente: string;
  dni: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  telefono: string;
  estado: number;
  correo: string;
  fecha_nacimiento: string;
  direccion: string | null;
  genero: number | null;
  fecha_registro: string;
};

export type PacienteCompleto = Paciente & {
  profiles: {
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    rol: string;
  } | null;
};

export async function crearPaciente(
  prevState: PacienteState,
  formData: FormData
): Promise<PacienteState> {
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

  if (!perfil || !["admin", "recepcionista"].includes(perfil.rol)) {
    return { error: "No tienes permisos para crear pacientes." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const primer_nombre = formData.get("primer_nombre") as string;
  const segundo_nombre = (formData.get("segundo_nombre") as string) || "";
  const primer_apellido = formData.get("primer_apellido") as string;
  const segundo_apellido = (formData.get("segundo_apellido") as string) || "";
  const dni = formData.get("dni") as string;
  const telefono = formData.get("telefono") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
  const direccion = (formData.get("direccion") as string) || "";
  const genero = formData.get("genero") as string;

  if (
    !email ||
    !password ||
    !primer_nombre ||
    !primer_apellido ||
    !dni ||
    !telefono ||
    !fecha_nacimiento
  ) {
    return { error: "Completa todos los campos obligatorios." };
  }

  const eEmail = validateEmail(email);
  if (eEmail) return { error: eEmail };

  const ePass = validatePassword(password);
  if (ePass) return { error: ePass };

  const ePNombre = validateName(primer_nombre, true);
  if (ePNombre) return { error: `Primer nombre: ${ePNombre}` };

  const eSNombre = validateName(segundo_nombre, false);
  if (eSNombre) return { error: `Segundo nombre: ${eSNombre}` };

  const ePApellido = validateApellido(primer_apellido, true);
  if (ePApellido) return { error: `Primer apellido: ${ePApellido}` };

  const eSApellido = validateApellido(segundo_apellido, false);
  if (eSApellido) return { error: `Segundo apellido: ${eSApellido}` };

  const eDni = validateDNI(dni);
  if (eDni) return { error: `DNI: ${eDni}` };

  const eTel = validateTelefono(telefono);
  if (eTel) return { error: `Teléfono: ${eTel}` };

  const eFecha = validateFechaNacimiento(fecha_nacimiento);
  if (eFecha) return { error: eFecha };

  if (direccion) {
    const eDir = validateDireccion(direccion);
    if (eDir) return { error: `Dirección: ${eDir}` };
  } else {
    return { error: "La dirección es obligatoria." };
  }

  if (genero) {
    const eGen = validateGenero(genero);
    if (eGen) return { error: eGen };
  } else {
    return { error: "Seleccione un género." };
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      dni,
      telefono,
      fecha_nacimiento,
      direccion,
      genero,
      rol: "paciente",
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/pacientes");
  return { success: true };
}

export async function editarPaciente(
  prevState: PacienteState,
  formData: FormData
): Promise<PacienteState> {
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

  if (!perfil || !["admin", "recepcionista"].includes(perfil.rol)) {
    return { error: "No tienes permisos para editar pacientes." };
  }

  const id_paciente = formData.get("id_paciente") as string;
  const primer_nombre = formData.get("primer_nombre") as string;
  const segundo_nombre = (formData.get("segundo_nombre") as string) || "";
  const primer_apellido = formData.get("primer_apellido") as string;
  const segundo_apellido = (formData.get("segundo_apellido") as string) || "";
  const dni = formData.get("dni") as string;
  const telefono = formData.get("telefono") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
  const direccion = (formData.get("direccion") as string) || "";
  const genero = formData.get("genero") as string;
  const estado = formData.get("estado") as string;

  if (
    !id_paciente ||
    !primer_nombre ||
    !primer_apellido ||
    !dni ||
    !telefono ||
    !fecha_nacimiento
  ) {
    return { error: "Completa todos los campos obligatorios." };
  }

  const ePNombre = validateName(primer_nombre, true);
  if (ePNombre) return { error: `Primer nombre: ${ePNombre}` };

  const eSNombre = validateName(segundo_nombre, false);
  if (eSNombre) return { error: `Segundo nombre: ${eSNombre}` };

  const ePApellido = validateApellido(primer_apellido, true);
  if (ePApellido) return { error: `Primer apellido: ${ePApellido}` };

  const eSApellido = validateApellido(segundo_apellido, false);
  if (eSApellido) return { error: `Segundo apellido: ${eSApellido}` };

  const eDni = validateDNI(dni);
  if (eDni) return { error: `DNI: ${eDni}` };

  const eTel = validateTelefono(telefono);
  if (eTel) return { error: `Teléfono: ${eTel}` };

  const eFecha = validateFechaNacimiento(fecha_nacimiento);
  if (eFecha) return { error: eFecha };

  if (direccion) {
    const eDir = validateDireccion(direccion);
    if (eDir) return { error: `Dirección: ${eDir}` };
  }

  const { error: errorProfile } = await supabase
    .from("profiles")
    .update({
      nombre: primer_nombre,
      apellido: primer_apellido,
      telefono,
    })
    .eq("id_profile", id_paciente);

  if (errorProfile)
    return {
      error: "Error al actualizar perfil: " + errorProfile.message,
    };

  const { error: errorPaciente } = await supabase
    .from("pacientes")
    .update({
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      dni,
      telefono,
      fecha_nacimiento,
      direccion,
      genero: genero ? Number(genero) : null,
      estado: estado ? Number(estado) : 1,
    })
    .eq("id_paciente", id_paciente);

  if (errorPaciente)
    return {
      error: "Error al actualizar paciente: " + errorPaciente.message,
    };

  revalidatePath("/dashboard/pacientes");
  revalidatePath("/dashboard/pacientes/" + id_paciente);
  return { success: true };
}

export async function actualizarMiPerfil(
  prevState: PacienteState,
  formData: FormData
): Promise<PacienteState> {
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

  if (!perfil) {
    return { error: "No se encontró tu perfil." };
  }

  const primer_nombre = formData.get("primer_nombre") as string;
  const segundo_nombre = (formData.get("segundo_nombre") as string) || "";
  const primer_apellido = formData.get("primer_apellido") as string;
  const segundo_apellido = (formData.get("segundo_apellido") as string) || "";
  const telefono = formData.get("telefono") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
  const direccion = (formData.get("direccion") as string) || "";
  const genero = formData.get("genero") as string;

  const esBasico = perfil.rol === "admin" || perfil.rol === "recepcionista";

  if (
    !primer_nombre ||
    !primer_apellido ||
    !telefono ||
    (!esBasico && !fecha_nacimiento)
  ) {
    return { error: "Completa todos los campos obligatorios." };
  }

  const ePNombre = validateName(primer_nombre, true);
  if (ePNombre) return { error: `Primer nombre: ${ePNombre}` };

  const ePApellido = validateApellido(primer_apellido, true);
  if (ePApellido) return { error: `Primer apellido: ${ePApellido}` };

  const eTel = validateTelefono(telefono);
  if (eTel) return { error: `Teléfono: ${eTel}` };

  if (!esBasico) {
    const eSNombre = validateName(segundo_nombre, false);
    if (eSNombre) return { error: `Segundo nombre: ${eSNombre}` };

    const eSApellido = validateApellido(segundo_apellido, false);
    if (eSApellido) return { error: `Segundo apellido: ${eSApellido}` };

    const eFecha = validateFechaNacimiento(fecha_nacimiento);
    if (eFecha) return { error: eFecha };

    if (direccion) {
      const eDir = validateDireccion(direccion);
      if (eDir) return { error: `Dirección: ${eDir}` };
    }
  }

  const { error: errorProfile } = await supabase
    .from("profiles")
    .update({
      nombre: primer_nombre,
      apellido: primer_apellido,
      telefono,
    })
    .eq("id_profile", user.id);

  if (errorProfile)
    return {
      error: "Error al actualizar perfil: " + errorProfile.message,
    };

  if (perfil.rol === "paciente") {
    const { error: errorPaciente } = await supabase
      .from("pacientes")
      .update({
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        telefono,
        fecha_nacimiento,
        direccion,
        genero: genero ? Number(genero) : null,
      })
      .eq("id_paciente", user.id);

    if (errorPaciente)
      return {
        error: "Error al actualizar paciente: " + errorPaciente.message,
      };
  } else if (perfil.rol === "doctor") {
    const { error: errorOdontologo } = await supabase
      .from("odontologos")
      .update({
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        telefono,
        fecha_nacimiento,
        direccion,
      })
      .eq("id_odontologo", user.id);

    if (errorOdontologo)
      return {
        error: "Error al actualizar odontólogo: " + errorOdontologo.message,
      };
  }

  revalidatePath("/dashboard/perfil");
  return { success: true };
}

export async function eliminarPaciente(id_paciente: string) {
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

  if (!perfil || perfil.rol !== "admin") {
    return {
      error: "Solo los administradores pueden eliminar pacientes.",
    };
  }

  const { error: errorPaciente } = await supabase
    .from("pacientes")
    .delete()
    .eq("id_paciente", id_paciente);

  if (errorPaciente)
    return {
      error: "Error al eliminar paciente: " + errorPaciente.message,
    };

  const { error: errorProfile } = await supabase
    .from("profiles")
    .delete()
    .eq("id_profile", id_paciente);

  if (errorProfile)
    return {
      error: "Error al eliminar perfil: " + errorProfile.message,
    };

  revalidatePath("/dashboard/pacientes");
  return { success: true };
}
