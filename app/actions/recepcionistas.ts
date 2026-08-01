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
  validateTelefono,
} from "@/utils/validations";

export type RecepcionistaState = { error: string } | { success: boolean } | null;

export type Recepcionista = {
  id_profile: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: string;
};

export async function crearRecepcionista(
  prevState: RecepcionistaState,
  formData: FormData
): Promise<RecepcionistaState> {
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
    return { error: "No tienes permisos para crear recepcionistas." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const primer_nombre = formData.get("primer_nombre") as string;
  const primer_apellido = formData.get("primer_apellido") as string;
  const telefono = formData.get("telefono") as string;

  if (!email || !password || !primer_nombre || !primer_apellido || !telefono) {
    return { error: "Completa todos los campos obligatorios." };
  }

  const eEmail = validateEmail(email);
  if (eEmail) return { error: eEmail };

  const ePass = validatePassword(password);
  if (ePass) return { error: ePass };

  const ePNombre = validateName(primer_nombre, true);
  if (ePNombre) return { error: `Primer nombre: ${ePNombre}` };

  const ePApellido = validateApellido(primer_apellido, true);
  if (ePApellido) return { error: `Primer apellido: ${ePApellido}` };

  const eTel = validateTelefono(telefono);
  if (eTel) return { error: `Teléfono: ${eTel}` };

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      primer_nombre,
      primer_apellido,
      telefono,
      rol: "recepcionista",
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/personal");
  return { success: true };
}

export async function editarRecepcionista(
  prevState: RecepcionistaState,
  formData: FormData
): Promise<RecepcionistaState> {
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
    return { error: "No tienes permisos para editar recepcionistas." };
  }

  const id_profile = formData.get("id_profile") as string;
  const primer_nombre = formData.get("primer_nombre") as string;
  const primer_apellido = formData.get("primer_apellido") as string;
  const telefono = formData.get("telefono") as string;

  if (!id_profile || !primer_nombre || !primer_apellido || !telefono) {
    return { error: "Completa todos los campos obligatorios." };
  }

  const ePNombre = validateName(primer_nombre, true);
  if (ePNombre) return { error: `Primer nombre: ${ePNombre}` };

  const ePApellido = validateApellido(primer_apellido, true);
  if (ePApellido) return { error: `Primer apellido: ${ePApellido}` };

  const eTel = validateTelefono(telefono);
  if (eTel) return { error: `Teléfono: ${eTel}` };

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: primer_nombre,
      apellido: primer_apellido,
      telefono,
    })
    .eq("id_profile", id_profile);

  if (error) return { error: "Error al actualizar perfil: " + error.message };

  revalidatePath("/dashboard/personal");
  return { success: true };
}

export async function eliminarRecepcionista(id_profile: string) {
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
      error: "Solo los administradores pueden eliminar recepcionistas.",
    };
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.auth.admin.deleteUser(id_profile);

  if (error)
    return {
      error: "Error al eliminar recepcionista: " + error.message,
    };

  revalidatePath("/dashboard/personal");
  return { success: true };
}
