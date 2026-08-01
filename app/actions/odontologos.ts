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
  validateSueldo,
} from "@/utils/validations";

export type OdontologoState = { error: string } | { success: boolean } | null;

export type Odontologo = {
  id_odontologo: string;
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
  sueldo: number;
  fecha_registro: string;
};

export async function crearOdontologo(
  prevState: OdontologoState,
  formData: FormData
): Promise<OdontologoState> {
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
    return { error: "No tienes permisos para crear odontólogos." };
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
  const sueldo = formData.get("sueldo") as string;

  if (
    !email ||
    !password ||
    !primer_nombre ||
    !primer_apellido ||
    !dni ||
    !telefono ||
    !fecha_nacimiento ||
    !sueldo
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

  const eSueldo = validateSueldo(sueldo);
  if (eSueldo) return { error: `Sueldo: ${eSueldo}` };

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
      sueldo,
      rol: "doctor",
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/odontologos");
  return { success: true };
}

export async function editarOdontologo(
  prevState: OdontologoState,
  formData: FormData
): Promise<OdontologoState> {
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
    return { error: "No tienes permisos para editar odontólogos." };
  }

  const id_odontologo = formData.get("id_odontologo") as string;
  const primer_nombre = formData.get("primer_nombre") as string;
  const segundo_nombre = (formData.get("segundo_nombre") as string) || "";
  const primer_apellido = formData.get("primer_apellido") as string;
  const segundo_apellido = (formData.get("segundo_apellido") as string) || "";
  const dni = formData.get("dni") as string;
  const telefono = formData.get("telefono") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
  const direccion = (formData.get("direccion") as string) || "";
  const estado = formData.get("estado") as string;
  const sueldo = formData.get("sueldo") as string;

  if (
    !id_odontologo ||
    !primer_nombre ||
    !primer_apellido ||
    !dni ||
    !telefono ||
    !fecha_nacimiento ||
    !sueldo
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

  const eSueldo = validateSueldo(sueldo);
  if (eSueldo) return { error: `Sueldo: ${eSueldo}` };

  const { error: errorProfile } = await supabase
    .from("profiles")
    .update({
      nombre: primer_nombre,
      apellido: primer_apellido,
      telefono,
    })
    .eq("id_profile", id_odontologo);

  if (errorProfile)
    return {
      error: "Error al actualizar perfil: " + errorProfile.message,
    };

  const { error: errorOdontologo } = await supabase
    .from("odontologos")
    .update({
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      dni,
      telefono,
      fecha_nacimiento,
      direccion,
      estado: estado ? Number(estado) : 1,
      sueldo: Number(sueldo),
    })
    .eq("id_odontologo", id_odontologo);

  if (errorOdontologo)
    return {
      error: "Error al actualizar odontólogo: " + errorOdontologo.message,
    };

  revalidatePath("/dashboard/odontologos");
  revalidatePath("/dashboard/odontologos/" + id_odontologo);
  return { success: true };
}

export async function eliminarOdontologo(id_odontologo: string) {
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
      error: "Solo los administradores pueden eliminar odontólogos.",
    };
  }

  const { error: errorOdontologo } = await supabase
    .from("odontologos")
    .delete()
    .eq("id_odontologo", id_odontologo);

  if (errorOdontologo)
    return {
      error: "Error al eliminar odontólogo: " + errorOdontologo.message,
    };

  const { error: errorProfile } = await supabase
    .from("profiles")
    .delete()
    .eq("id_profile", id_odontologo);

  if (errorProfile)
    return {
      error: "Error al eliminar perfil: " + errorProfile.message,
    };

  revalidatePath("/dashboard/odontologos");
  return { success: true };
}
