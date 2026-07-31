"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

//tratamientos
export async function crearTratamiento(formData: FormData) {
    const supabase = await createClient();

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio = Number(formData.get("precio"));

    if (!nombre || precio <= 0) {
        return { error: "Nombre requerido y precio debe ser mayor a 0" };
    }

    const { error } = await supabase
        .from("tratamiento")
        .insert({ nombre, descripcion, precio });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/tratamientos");
    return { success: true };
}

export async function editarTratamiento(id: string, formData: FormData) {
    const supabase = await createClient();

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio = Number(formData.get("precio"));

    if (!nombre || precio <= 0) {
        return { error: "Nombre requerido y precio debe ser mayor a 0" };
    }

    const { error } = await supabase
        .from("tratamiento")
        .update({ nombre, descripcion, precio })
        .eq("id_tratamiento", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/tratamientos");
    return { success: true };
}

export async function eliminarTratamiento(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("tratamiento")
        .delete()
        .eq("id_tratamiento", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/tratamientos");
    return { success: true };
}

//inventario

export async function crearProducto(formData: FormData) {
    const supabase = await createClient();

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio = Number(formData.get("precio"));
    const stock = Number(formData.get("stock"));
    const unidad_medida = formData.get("unidad_medida") as string;

    if (!nombre || precio <= 0 || stock < 0) {
        return { error: "Datos inválidos: revisa nombre, precio y stock" };
    }

    const { error } = await supabase
        .from("producto")
        .insert({ nombre, descripcion, precio, stock, unidad_medida, estado: 1 });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/inventario");
    return { success: true };
}

export async function actualizarStock(id: string, nuevoStock: number) {
    const supabase = await createClient();

    if (nuevoStock < 0) return { error: "El stock no puede ser negativo" };

    const { error } = await supabase
        .from("producto")
        .update({ stock: nuevoStock })
        .eq("id_producto", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/inventario");
    return { success: true };
}

export async function editarProducto(id: string, formData: FormData) {
    const supabase = await createClient();

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio = Number(formData.get("precio"));
    const unidad_medida = formData.get("unidad_medida") as string;

    if (!nombre || precio <= 0) {
        return { error: "Nombre requerido y precio debe ser mayor a 0" };
    }

    const { error } = await supabase
        .from("producto")
        .update({ nombre, descripcion, precio, unidad_medida })
        .eq("id_producto", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/inventario");
    return { success: true };
}

//metodo de pago

export async function toggleMetodoPago(id: string, activo: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("metodo_pago")
        .update({ activo })
        .eq("id_metodo_pago", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/configuracion");
    return { success: true };
}
export async function crearMetodoPago(formData: FormData) {
    const supabase = await createClient();

    const nombre = formData.get("nombre") as string;

    if (!nombre?.trim()) {
    return { error: "El nombre es obligatorio" };
    }

    const { error } = await supabase
    .from("metodo_pago")
    .insert({ nombre, activo: true });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/configuracion");
    return { success: true };
}
// descuento

export async function crearDescuento(formData: FormData) {
    const supabase = await createClient();

    const nombre = formData.get("nombre") as string;
    const tipo = formData.get("tipo") as string;
    const valor = Number(formData.get("valor"));
    const fecha_inicio = formData.get("fecha_inicio") as string;
    const fecha_fin = formData.get("fecha_fin") as string;

    if (tipo === "porcentaje" && (valor < 0 || valor > 100)) {
        return { error: "El porcentaje debe estar entre 0 y 100" };
    }
    if (valor <= 0) {
        return { error: "El valor debe ser mayor a 0" };
    }
    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        return { error: "La fecha fin no puede ser anterior a la fecha inicio" };
    }

    const { error } = await supabase
        .from("descuento")
        .insert({ nombre, tipo, valor, fecha_inicio, fecha_fin, activo: true });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/descuentos");
    return { success: true };
}

export async function toggleDescuento(id: string, activo: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("descuento")
        .update({ activo })
        .eq("id_descuento", id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/descuentos");
    return { success: true };
}



