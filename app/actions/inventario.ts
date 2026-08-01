"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function agregarProducto(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const precio = formData.get("precio") as string;
  const stock = formData.get("stock") as string;
  const unidad_medida = formData.get("unidad_medida") as string;

  const { error } = await supabase.from("producto").insert({
    nombre,
    descripcion,
    precio: parseFloat(precio),
    stock: parseInt(stock),
    unidad_medida,
    estado: 1, // 1 para activo por defecto
  });

  if (error) {
    return { error: "Error al guardar: " + error.message, success: false };
  }

  // Recarga la página para mostrar el nuevo producto
  revalidatePath("/dashboard/inventario");
  return { success: true, error: null };
}

export async function eliminarProducto(id_producto: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("producto")
    .delete()
    .eq("id_producto", id_producto);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inventario");
}