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
  const tipoDocumento = formData.get("tipo_documento") as string || "01";

  const fieldErrors: Record<string, string> = {};
  if (!idPaciente) fieldErrors.id_paciente = "Seleccione un paciente";
  if (!["01", "02"].includes(tipoDocumento)) fieldErrors.tipo_documento = "Tipo de documento inválido";

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

  const { data: factura, error: errFactura } = await supabase
    .from("factura")
    .insert({
      id_paciente: idPaciente,
      fecha: fechaFinal,
      subtotal,
      impuestos,
      tipo_documento: tipoDocumento,
      no_factura: noFactura,
    })
    .select("id_factura")
    .single();

  if (errFactura) return { error: errFactura.message };

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

export type PagoState = {
  success?: boolean;
  error?: string;
} | null;

export async function registrarPago(
  prevState: PagoState,
  formData: FormData
): Promise<PagoState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const idFactura = formData.get("id_factura") as string;
  const idMetodoPago = formData.get("id_metodo_pago") as string;
  const idDescuento = (formData.get("id_descuento") as string) || "";
  const monto = parseFloat(formData.get("monto") as string) || 0;
  const referencia = (formData.get("referencia") as string) || "";
  let observaciones = (formData.get("observaciones") as string) || "";

  if (!idMetodoPago) return { error: "Seleccione un método de pago" };
  if (monto <= 0) return { error: "Ingrese un monto válido" };

  const { data: factura, error: errFact } = await supabase
    .from("factura")
    .select("id_paciente, total, descuento, estado")
    .eq("id_factura", idFactura)
    .single();

  if (errFact || !factura) return { error: "Factura no encontrada" };

  // Saldo pendiente real (antes de este pago), calculado con lo ya abonado
  const { data: pagosPrevios } = await supabase
    .from("pagos")
    .select("monto")
    .eq("id_factura", idFactura);

  const pagadoPrevio = pagosPrevios?.reduce((s, p) => s + Number(p.monto), 0) ?? 0;
  const pendienteActual = Math.max(0, Number(factura.total) - pagadoPrevio);

  let totalFacturaActualizado = Number(factura.total);

  // Si se seleccionó un descuento, se valida contra la base de datos (nunca se confía
  // en el monto calculado en el navegador) y se descuenta del TOTAL de la factura
  // (columna que ya existe para eso: subtotal + impuestos - descuento = total),
  // para que el saldo pendiente refleje el descuento de aquí en adelante.
  if (idDescuento) {
    const { data: descuento, error: errDescuento } = await supabase
      .from("descuento")
      .select("nombre, tipo, valor, activo")
      .eq("id_descuento", idDescuento)
      .single();

    if (errDescuento || !descuento || !descuento.activo) {
      return { error: "El descuento seleccionado no es válido" };
    }

    const montoDescuento = Math.min(
      pendienteActual,
      descuento.tipo === "%"
        ? (pendienteActual * Number(descuento.valor)) / 100
        : Number(descuento.valor)
    );

    totalFacturaActualizado = Number(factura.total) - montoDescuento;

    const { error: errFacturaUpdate } = await supabase
      .from("factura")
      .update({
        total: totalFacturaActualizado,
        descuento: Number(factura.descuento) + montoDescuento,
      })
      .eq("id_factura", idFactura);

    if (errFacturaUpdate) return { error: errFacturaUpdate.message };

    const nota = `[Descuento aplicado: ${descuento.nombre} (${descuento.tipo === "%" ? `${descuento.valor}%` : `L. ${descuento.valor}`}) = -L. ${montoDescuento.toFixed(2)}]`;
    observaciones = observaciones ? `${nota} ${observaciones}` : nota;
  }

  const { error: errPago } = await supabase.from("pagos").insert({
    id_factura: idFactura,
    id_metodo_pago: idMetodoPago,
    id_paciente: factura.id_paciente,
    monto,
    referencia: referencia || null,
    observaciones: observaciones || null,
    fecha_pago: new Date().toISOString(),
  });

  if (errPago) return { error: errPago.message };

  const { data: pagos } = await supabase
    .from("pagos")
    .select("monto")
    .eq("id_factura", idFactura);

  const totalPagado = pagos?.reduce((s, p) => s + Number(p.monto), 0) ?? 0;
  const nuevoEstado = totalPagado >= totalFacturaActualizado ? 2 : 1;

  const { error: errUpdate } = await supabase
    .from("factura")
    .update({ estado: nuevoEstado })
    .eq("id_factura", idFactura);

  if (errUpdate) return { error: errUpdate.message };

  revalidatePath("/dashboard/facturacion");
  return { success: true };
}

export async function eliminarFactura(idFactura: string): Promise<FacturaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error: errDetalles } = await supabase
    .from("detalle_factura")
    .delete()
    .eq("id_factura", idFactura);

  if (errDetalles) return { error: errDetalles.message };

  const { error: errPagos } = await supabase
    .from("pagos")
    .delete()
    .eq("id_factura", idFactura);

  if (errPagos) return { error: errPagos.message };

  const { error } = await supabase
    .from("factura")
    .delete()
    .eq("id_factura", idFactura);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/facturacion");
  return { success: true };
}

export type GenerarFacturaCitaParams = {
  idPaciente: string;
  tratamientos: {
    id_tratamiento: string;
    cantidad: number;
    precio_unitario: number;
    id_descuento?: string;
    monto_descuento?: number;
  }[];
  tipoDocumento?: string; // Por defecto "01"
  aplicaISV?: boolean;   // Por defecto true (15%)
};

export async function generarFacturaAutomaticaCita({
  idPaciente,
  tratamientos,
  tipoDocumento = "01",
  aplicaISV = true,
}: GenerarFacturaCitaParams): Promise<FacturaState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  if (!idPaciente) return { error: "ID de paciente requerido" };
  if (!tratamientos || tratamientos.length === 0) return { error: "No hay tratamientos para facturar" };

  // 1. Subtotal a partir de la lista de tratamientos de la consulta
  const subtotal = tratamientos.reduce(
    (sum, t) => sum + (t.cantidad || 1) * t.precio_unitario - (t.monto_descuento || 0),
    0
  );

  // ISV (15%) basado en subtotal si aplica
  const impuestos = aplicaISV ? subtotal * 0.15 : 0;
  const fechaFinal = new Date().toISOString().slice(0, 10);

  // 2. Correlativo exactamente con tu formato: 000-001-01-XXXXXXX
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

  // 3. Creación del registro en tabla 'factura' (con estado 1: Pendiente)
  const { data: factura, error: errFactura } = await supabase
    .from("factura")
    .insert({
      id_paciente: idPaciente,
      fecha: fechaFinal,
      subtotal,
      impuestos,
      tipo_documento: tipoDocumento,
      no_factura: noFactura,
      estado: 1, // 1 = Pendiente
    })
    .select("id_factura")
    .single();

  if (errFactura) return { error: errFactura.message };

  // 4. Inserción en 'detalle_factura'
  const detallesInsert = tratamientos.map((t) => ({
    id_factura: factura.id_factura,
    id_tratamiento: t.id_tratamiento || null,
    cantidad: t.cantidad || 1,
    precio_unitario: t.precio_unitario,
    id_descuento: t.id_descuento || null,
    monto_descuento: t.monto_descuento || 0,
  }));

  const { error: errDetalles } = await supabase
    .from("detalle_factura")
    .insert(detallesInsert);

  // Rollback si fallan los detalles
  if (errDetalles) {
    await supabase.from("factura").delete().eq("id_factura", factura.id_factura);
    return { error: errDetalles.message };
  }

  revalidatePath("/dashboard/facturacion");
  return { success: true };
}