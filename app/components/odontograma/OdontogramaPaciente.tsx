"use client";

import { useState } from "react";
import { Odontograma } from "./Odontograma";

// Función para asignar estilos de Badge dinámicos
function getBadgeStyles(estadoObj: any) {
  const nombre = (estadoObj?.nombre || "").toLowerCase();
  const hexColor = estadoObj?.color;

  // Si es Ausente / Extracción
  if (nombre.includes("ausente") || nombre.includes("extra") || nombre.includes("perdid")) {
    return {
      bg: "bg-slate-100",
      text: "text-slate-800",
      border: "border-slate-200",
      dot: "bg-slate-700",
    };
  }

  // Si es Caries / Patología / Problema urgente
  if (nombre.includes("carie") || nombre.includes("fractura") || nombre.includes("urgente")) {
    return {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-100",
      dot: "bg-red-500",
    };
  }

  // Si es Tratamiento / Endodoncia / Corona / Obturación
  if (
    nombre.includes("trata") ||
    nombre.includes("corona") ||
    nombre.includes("endo") ||
    nombre.includes("obtur") ||
    nombre.includes("resina")
  ) {
    return {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-100",
      dot: "bg-blue-500",
    };
  }

  // Si viene un color Hex de la BD (Fallback dinámico)
  if (hexColor && hexColor !== "#DCFCE7") {
    return {
      bg: "bg-amber-50",
      text: "text-amber-900",
      border: "border-amber-100",
      dotStyle: { backgroundColor: hexColor.startsWith("#") ? hexColor : `#${hexColor}` },
    };
  }

  // Por defecto (Sano)
  return {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  };
}

export function OdontogramaPaciente({ dientes }: { dientes: any[] }) {
  const [dienteSeleccionado, setDienteSeleccionado] = useState<any | null>(null);

  // 1. Extraer número y nombre del diente
  const numeroDiente = dienteSeleccionado?.numero_fdi ?? dienteSeleccionado?.numero ?? "";
  const nombreDiente = dienteSeleccionado?.nombre ?? "";

  // 2. Buscar coincidencia en el listado de BD por si el clic devuelve solo la forma
  const dienteBD = dientes?.find((d) => {
    const numBD = d.numero_fdi ?? d.numero ?? d.id_diente_num ?? d.id_diente;
    return String(numBD) === String(numeroDiente) || d.id_diente === dienteSeleccionado?.id_diente;
  });

  // Objeto fusionado
  const infoCompleta = dienteBD ? { ...dienteSeleccionado, ...dienteBD } : dienteSeleccionado;

  // 3. Extraer estado
  const estadoObj = infoCompleta?.estadoActual;
  const estadoNombre =
    estadoObj?.nombre ??
    (typeof infoCompleta?.estado === "string" ? infoCompleta.estado : null);

  // 4. Extraer OBSERVACIONES REALES ingresadas por el odontólogo
  const observacionesReales =
    infoCompleta?.observaciones ??
    infoCompleta?.observacion ??
    infoCompleta?.observacion_reciente ??
    infoCompleta?.notas ??
    infoCompleta?.diagnostico ??
    infoCompleta?.detalle ??
    null;

  const badgeStyle = getBadgeStyles(estadoObj || { nombre: estadoNombre });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Grilla con Odontograma */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-xs font-sans font-bold text-gray-400 tracking-wider uppercase mb-6">
          ODONTOGRAMA
        </p>
        <Odontograma
          dientes={dientes}
          seleccionado={dienteSeleccionado}
          onSeleccionar={setDienteSeleccionado}
        />
      </div>

      {/* Tarjeta Lateral de Estado (Solo lectura) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-xs font-sans font-bold text-gray-400 tracking-wider uppercase mb-4">
          ESTADO
        </p>

        {dienteSeleccionado ? (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-wider mb-1">
                DIENTE
              </p>
              <p className="text-base font-sans font-bold text-gray-900 leading-snug">
                {numeroDiente ? `${numeroDiente} — ` : ""}
                {nombreDiente || "Sin nombre registrado"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-wider mb-2">
                ESTADO ACTUAL
              </p>
              <span
                className={`inline-flex items-center gap-2 text-xs font-sans font-semibold px-3 py-1.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${badgeStyle.dot || ""}`}
                  style={badgeStyle.dotStyle}
                />
                {estadoNombre || "Sano / Sin registro"}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-wider mb-1">
                OBSERVACIONES MÁS RECIENTES
              </p>
              <p className="text-sm font-sans text-gray-700 leading-relaxed font-normal bg-gray-50 p-3 rounded-xl border border-gray-100">
                {observacionesReales || "Sin observaciones registradas para este diente."}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm font-sans text-gray-400">
              Haz clic en cualquier diente para ver su estado y observaciones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}