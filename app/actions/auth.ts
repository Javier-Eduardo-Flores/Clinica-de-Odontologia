"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signIn(prevState:{error:string}|null, formData:FormData){
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

export async function signUp(prevState: {error: string} | null, formData: FormData){
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const primer_nombre = formData.get("primer_nombre") as string;
    const segundo_nombre = formData.get("segundo_nombre") as string;
    const primer_apellido = formData.get("primer_apellido") as string;
    const segundo_apellido = formData.get("segundo_apellido") as string;
    const dni = formData.get("dni") as string;
    const telefono = formData.get("telefono") as string;
    const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
    const direccion = formData.get("direccion") as string;
    const genero = formData.get("genero") as string;

    if(!email || !password || !primer_nombre || !primer_apellido || !dni || !telefono || !fecha_nacimiento){
        return {error: "Completa todos los campos obligatorios"};
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Email inválido" };
    }

    if (password.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres" };
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
    redirect("/login");
    //redirect("/login?message=Revisa tu email para confirmar");
}   

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/","layout");
    redirect("/login");
}   