"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


type LineaTratamiento = {
    id_tratamiento: string;
    cantidad: number;
    observaciones: string;
};

export async function registrarConsultaRPC(data: {
    id_cita: string;
    id_odontologo: string;
    fecha: string;
    diagnostico: string;
    observaciones: string;
    tratamientos: LineaTratamiento[];
}) {
    const supabase = await createClient();

    const { data: idConsulta, error } = await supabase.rpc("registrar_consulta_completa", {
        p_id_cita: data.id_cita,
        p_id_odontologo: data.id_odontologo,
        p_fecha: data.fecha,
        p_diagnostico: data.diagnostico,
        p_observaciones: data.observaciones,
        p_tratamientos: data.tratamientos,
    });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/consultas");
    return { success: true, id_consulta: idConsulta };
}

export async function editarConsulta(
    id: string,
    data: {
    diagnostico: string;
    observaciones: string;
    tratamientos: { id_tratamiento: string; cantidad: number; observaciones: string }[];
    }
) {
    const supabase = await createClient();

    if (!data.diagnostico?.trim()) {
        return { error: "El diagnóstico es obligatorio" };
    }
    if (data.tratamientos.length === 0) {
        return { error: "Debe quedar al menos un tratamiento" };
    }

    const { error: errorConsulta } = await supabase
    .from("consultas")
    .update({ diagnostico: data.diagnostico, observaciones: data.observaciones })
    .eq("id_consulta", id);

    if (errorConsulta) return { error: errorConsulta.message };


    const { error: errorDelete } = await supabase
        .from("detalle_consultas")
        .delete()
        .eq("id_consulta", id);

    if (errorDelete) return { error: errorDelete.message };

    const filas = data.tratamientos.map((t) => ({
        id_consulta: id,
        id_tratamiento: t.id_tratamiento,
        cantidad: t.cantidad,
        observaciones: t.observaciones,
    }));

    const { error: errorInsert } = await supabase.from("detalle_consultas").insert(filas);

    if (errorInsert) return { error: errorInsert.message };

    revalidatePath(`/dashboard/consultas/${id}`);
    return { success: true };
}

export async function eliminarConsulta(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("consultas").delete().eq("id_consulta", id);

    if (error) return { error: "No tienes permiso para eliminar esta consulta." };

    revalidatePath("/dashboard/consultas");
    return { success: true };
}

type LineaProducto = {
    id_producto: string;
    cantidad: number;
    observaciones: string;
};

export async function completarCitaConConsulta(data: {
    id_cita: string;
    id_odontologo: string;
    diagnostico: string;
    observaciones: string;
    tratamientos: LineaTratamiento[];
    productos: LineaProducto[];
}) {
    const supabase = await createClient();

    if (!data.diagnostico?.trim()) {
        return { error: "El diagnóstico es obligatorio" };
    }
    if (data.tratamientos.length === 0) {
        return { error: "Agrega al menos un tratamiento" };
    }

    const { data: nuevaConsulta, error: errorConsulta } = await supabase
        .from("consultas")
        .insert({
            id_cita: data.id_cita,
            id_odontologo: data.id_odontologo,
            fecha: new Date().toISOString().slice(0, 10),
            diagnostico: data.diagnostico,
            observaciones: data.observaciones,
        })
        .select("id_consulta")
        .single();

    if (errorConsulta) return { error: errorConsulta.message };

    const filasTratamientos = data.tratamientos.map((t) => ({
        id_consulta: nuevaConsulta.id_consulta,
        id_tratamiento: t.id_tratamiento,
        id_producto: null,
        cantidad: t.cantidad,
        observaciones: t.observaciones,
    }));

    const filasProductos = data.productos.map((p) => ({
        id_consulta: nuevaConsulta.id_consulta,
        id_tratamiento: null,
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        observaciones: p.observaciones,
    }));

    const { error: errorDetalle } = await supabase
        .from("detalle_consultas")
        .insert([...filasTratamientos, ...filasProductos]);

    if (errorDetalle) {
        await supabase.from("consultas").delete().eq("id_consulta", nuevaConsulta.id_consulta);
        return { error: errorDetalle.message };
    }

    for (const p of data.productos) {
        const { data: productoActual } = await supabase
            .from("producto")
            .select("stock")
            .eq("id_producto", p.id_producto)
            .maybeSingle();

        if (productoActual) {
            await supabase
                .from("producto")
                .update({ stock: productoActual.stock - p.cantidad })
                .eq("id_producto", p.id_producto);
        }
    }

    const { error: errorCita } = await supabase
        .from("citas")
        .update({ estado: 4 })
        .eq("id_cita", data.id_cita);

    if (errorCita) return { error: errorCita.message };

    revalidatePath(`/dashboard/citas/${data.id_cita}`);
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/consultas");
    return { success: true };
}

export async function completarCitaCompleta(data: {
    id_cita: string;
    id_odontologo: string;
    id_paciente: string;
    medicamentos_actuales: string;
    observaciones_expediente: string;
    diagnostico: string;
    observaciones_consulta: string;
    tratamientos: LineaTratamiento[];
    productos: LineaProducto[];
}) {
    const supabase = await createClient();

    if (!data.diagnostico?.trim()) {
        return { error: "El diagnóstico es obligatorio" };
    }
    if (data.tratamientos.length === 0 && data.productos.length === 0) {
        return { error: "Agrega al menos un tratamiento o un producto" };
    }

    const { error: errorExpediente } = await supabase
        .from("expediente")
        .upsert(
            {
                id_paciente: data.id_paciente,
                medicamentos_actuales: data.medicamentos_actuales,
                observaciones: data.observaciones_expediente,
            },
            { onConflict: "id_paciente" }
        );

    if (errorExpediente) return { error: errorExpediente.message };

    const { data: nuevaConsulta, error: errorConsulta } = await supabase
        .from("consultas")
        .insert({
            id_cita: data.id_cita,
            id_odontologo: data.id_odontologo,
            fecha: new Date().toISOString().slice(0, 10),
            diagnostico: data.diagnostico,
            observaciones: data.observaciones_consulta,
        })
        .select("id_consulta")
        .single();

    if (errorConsulta) return { error: errorConsulta.message };
    const filasTratamientos = data.tratamientos.map((t) => ({
        id_consulta: nuevaConsulta.id_consulta,
        id_tratamiento: t.id_tratamiento,
        id_producto: null,
        cantidad: t.cantidad,
        observaciones: t.observaciones,
    }));

    const filasProductos = data.productos.map((p) => ({
        id_consulta: nuevaConsulta.id_consulta,
        id_tratamiento: null,
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        observaciones: p.observaciones,
    }));

    const { error: errorDetalle } = await supabase
        .from("detalle_consultas")
        .insert([...filasTratamientos, ...filasProductos]);

    if (errorDetalle) {
        await supabase.from("consultas").delete().eq("id_consulta", nuevaConsulta.id_consulta);
        return { error: errorDetalle.message };
    }

    for (const p of data.productos) {
        const { data: productoActual } = await supabase
            .from("producto")
            .select("stock")
            .eq("id_producto", p.id_producto)
            .maybeSingle();

        if (productoActual) {
            await supabase
                .from("producto")
                .update({ stock: productoActual.stock - p.cantidad })
                .eq("id_producto", p.id_producto);
        }
    }

    // =====================================================================
    // GENERAR FACTURA AUTOMÁTICAMENTE con todos los tratamientos y
    // productos registrados en esta consulta.
    // =====================================================================
    if (data.tratamientos.length > 0 || data.productos.length > 0) {
        const idsTratamiento = data.tratamientos.map((t) => t.id_tratamiento);
        const idsProducto = data.productos.map((p) => p.id_producto);

        const [{ data: preciosTratamientos }, { data: preciosProductos }] = await Promise.all([
            idsTratamiento.length > 0
                ? supabase.from("tratamiento").select("id_tratamiento, precio").in("id_tratamiento", idsTratamiento)
                : Promise.resolve({ data: [] as { id_tratamiento: string; precio: number }[] }),
            idsProducto.length > 0
                ? supabase.from("producto").select("id_producto, precio").in("id_producto", idsProducto)
                : Promise.resolve({ data: [] as { id_producto: string; precio: number }[] }),
        ]);

        console.log("[FACTURA-DEBUG] idsTratamiento:", idsTratamiento);
        console.log("[FACTURA-DEBUG] preciosTratamientos recibidos:", preciosTratamientos);
        console.log("[FACTURA-DEBUG] idsProducto:", idsProducto);
        console.log("[FACTURA-DEBUG] preciosProductos recibidos:", preciosProductos);

        const mapaPreciosTratamiento = new Map((preciosTratamientos ?? []).map((t) => [t.id_tratamiento, Number(t.precio)]));
        const mapaPreciosProducto = new Map((preciosProductos ?? []).map((p) => [p.id_producto, Number(p.precio)]));

        const lineasFactura: {
            id_tratamiento: string | null;
            id_producto: string | null;
            cantidad: number;
            precio_unitario: number;
        }[] = [];

        for (const t of data.tratamientos) {
            const precio = mapaPreciosTratamiento.get(t.id_tratamiento) ?? 0;
            lineasFactura.push({ id_tratamiento: t.id_tratamiento, id_producto: null, cantidad: t.cantidad, precio_unitario: precio });
        }
        for (const p of data.productos) {
            const precio = mapaPreciosProducto.get(p.id_producto) ?? 0;
            lineasFactura.push({ id_tratamiento: null, id_producto: p.id_producto, cantidad: p.cantidad, precio_unitario: precio });
        }

        const subtotal = lineasFactura.reduce((acc, l) => acc + l.precio_unitario * l.cantidad, 0);
        const impuestos = Number((subtotal * 0.15).toFixed(2)); // ISV 15% — AJUSTA si tu clínica usa otra tasa
        const total = Number((subtotal + impuestos).toFixed(2));
        const tipoDocumento = "01";

        // Correlativo de factura (Formato: 000-001-01-XXXXXXXX)
        const prefix = `000-001-${tipoDocumento}-`;
        const { data: ultimaFactura } = await supabase
            .from("factura")
            .select("no_factura")
            .like("no_factura", `${prefix}%`)
            .order("no_factura", { ascending: false })
            .limit(1);

        let siguienteCorrelativo = 1;
        if (ultimaFactura?.[0]?.no_factura) {
            const ultimoNum = parseInt(ultimaFactura[0].no_factura.slice(-8), 10);
            if (!isNaN(ultimoNum)) siguienteCorrelativo = ultimoNum + 1;
        }
        const noFactura = `${prefix}${String(siguienteCorrelativo).padStart(8, "0")}`;

        const payloadFactura = {
            id_paciente: data.id_paciente,
            fecha: new Date().toISOString().slice(0, 10),
            subtotal: Number(subtotal.toFixed(2)),
            impuestos,
            total,
            tipo_documento: tipoDocumento,
            no_factura: noFactura,
            estado: 1, // Pendiente de pago
        };
        console.log("[FACTURA-DEBUG] payload que se va a insertar en factura:", payloadFactura);

        const { data: nuevaFactura, error: errorFactura } = await supabase
            .from("factura")
            .insert(payloadFactura)
            .select("id_factura, subtotal, impuestos, total")
            .single();

        console.log("[FACTURA-DEBUG] resultado del INSERT (lo que realmente quedó guardado):", nuevaFactura);
        console.log("[FACTURA-DEBUG] error del INSERT (si hubo):", errorFactura);

        if (errorFactura) {
            console.error("Error al crear la factura:", errorFactura.message);
        } else if (nuevaFactura) {
            const filasDetalleFactura = lineasFactura.map((l) => ({
                id_factura: nuevaFactura.id_factura,
                id_tratamiento: l.id_tratamiento,
                id_producto: l.id_producto,
                cantidad: l.cantidad,
                precio_unitario: l.precio_unitario,
                monto_descuento: 0,
            }));

            const { error: errorDetalleFactura } = await supabase.from("detalle_factura").insert(filasDetalleFactura);
            if (errorDetalleFactura) {
                console.error("Error al insertar detalle de factura:", errorDetalleFactura.message);
            }
        }
    }

    const { error: errorCita } = await supabase
        .from("citas")
        .update({ estado: 4 })
        .eq("id_cita", data.id_cita);

    if (errorCita) return { error: errorCita.message };

    revalidatePath(`/dashboard/citas/${data.id_cita}`);
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/consultas");
    revalidatePath("/dashboard/facturacion");
    return { success: true };
}