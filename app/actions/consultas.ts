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