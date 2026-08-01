"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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

export type AuthState = { error: string } | { success: boolean } | null;

export async function signIn(prevState: AuthState, formData: FormData){
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if(!email || !password){
        return {error: "Email y contraseña son campos obligatorios"};
    }

    const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error){
        return {error:error.message};
    }

    revalidatePath("/","layout");
    redirect("/dashboard");
}

export async function signUp(prevState: AuthState, formData: FormData){
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const primer_nombre = formData.get("primer_nombre") as string;
    const segundo_nombre = formData.get("segundo_nombre") as string || "";
    const primer_apellido = formData.get("primer_apellido") as string;
    const segundo_apellido = formData.get("segundo_apellido") as string || "";
    const dni = formData.get("dni") as string;
    const telefono = formData.get("telefono") as string;
    const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
    const direccion = formData.get("direccion") as string;
    const genero = formData.get("genero") as string;

    if(!email || !password || !primer_nombre || !primer_apellido || !dni || !telefono || !fecha_nacimiento){
        return {error: "Completa todos los campos obligatorios"};
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
        return { error: 'Dirección: Este campo es obligatorio' };
    }

    if (genero) {
        const eGen = validateGenero(genero);
        if (eGen) return { error: eGen };
    } else {
        return { error: 'Seleccione un género' };
    }

    const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
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
        },
    });

    if(error)
        return {error: error.message};

    revalidatePath("/","layout");
    return { success: true };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/","layout");
    redirect("/login");
}

// Función para recuperar la contraseña 
export async function recuperarPassword(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
  });

  if (error) {
    return { error: "No se pudo enviar el correo: " + error.message, success: false };
  }

  return { success: true, error: null };
}