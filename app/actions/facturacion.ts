"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type FacturaState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

const ESTADO_LABEL: Record<number, string> = {
  1: "Pendiente",
  2: "Pagada",
  3: "Cancelada",
};

export async function crearFactura(
  prevState: FacturaState,
  formData: FormData
): Promise<FacturaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const idPaciente = formData.get("id_paciente") as string;
  const fecha = formData.get("fecha") as string;
  const impuestos = parseFloat(formData.get("impuestos") as string) || 0;
  const detallesRaw = formData.get("detalles") as string;

  const fieldErrors: Record<string, string> = {};
  if (!idPaciente) fieldErrors.id_paciente = "Seleccione un paciente";

  let detalles: {
    id_tratamiento?: string;
    id_producto?: string;
    cantidad: number;
    precio_unitario: number;
    id_descuento?: string;
    monto_descuento: number;
  }[] = [];

  try {
    detalles = JSON.parse(detallesRaw);
  } catch {
    fieldErrors.detalles = "Error en los detalles de la factura";
  }

  if (!detalles || detalles.length === 0)
    fieldErrors.detalles = "Agregue al menos un detalle";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const subtotal = detalles.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);

  const fechaFinal = fecha || new Date().toISOString().slice(0, 10);

  const { data: factura, error: errFactura } = await supabase
    .from("factura")
    .insert({
      id_paciente: idPaciente,
      fecha: fechaFinal,
      subtotal,
      impuestos,
    })
    .select("id_factura")
    .single();

  if (errFactura) return { error: errFactura.message };

  const noFactura = `FAC-${fechaFinal.slice(0, 7).replace("-", "")}-${factura.id_factura.slice(0, 8).toUpperCase()}`;

  const { error: errNoFactura } = await supabase
    .from("factura")
    .update({ no_factura: noFactura })
    .eq("id_factura", factura.id_factura);

  if (errNoFactura) return { error: errNoFactura.message };

  const detallesInsert = detalles.map((d) => ({
    id_factura: factura.id_factura,
    id_tratamiento: d.id_tratamiento || null,
    id_producto: d.id_producto || null,
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
    id_descuento: d.id_descuento || null,
    monto_descuento: d.monto_descuento || 0,
  }));

  const { error: errDetalles } = await supabase
    .from("detalle_factura")
    .insert(detallesInsert);

  if (errDetalles) {
    await supabase.from("factura").delete().eq("id_factura", factura.id_factura);
    return { error: errDetalles.message };
  }

  revalidatePath("/dashboard/facturacion");
  return { success: true };
}

export async function actualizarEstadoFactura(
  idFactura: string,
  estado: number
): Promise<FacturaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  if (![1, 2, 3].includes(estado)) return { error: "Estado inválido" };

  const { error } = await supabase
    .from("factura")
    .update({ estado })
    .eq("id_factura", idFactura);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/facturacion");
  return { success: true };
}

export async function eliminarFactura(idFactura: string): Promise<FacturaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("factura")
    .delete()
    .eq("id_factura", idFactura);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/facturacion");
  return { success: true };
}
