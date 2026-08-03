"use client";
import { useState } from "react";
import { Eye, X } from "lucide-react";

export default function DetalleTratamientoBoton({
  fecha,
  tratamiento,
  doctor,
  diagnostico,
}: {
  fecha: string;
  tratamiento: string;
  doctor: string;
  diagnostico: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-clinica-dark transition-colors"
        aria-label="Ver detalle del tratamiento"
      >
        <Eye size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-sans font-bold text-gray-900">Detalle del Tratamiento</h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-sm font-sans">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Fecha</p>
                <p className="text-gray-900">
                  {new Date(fecha).toLocaleDateString("es-HN", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tratamiento</p>
                <p className="text-gray-900">{tratamiento || "Consulta general"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Doctor</p>
                <p className="text-gray-900">{doctor}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Diagnóstico</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {diagnostico || "Sin diagnóstico registrado."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 