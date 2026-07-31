'use client';
import type { DienteConEstado } from './odontograma.types';

export function PanelEstadoDiente({ diente }: { diente: DienteConEstado | null }) {
    if (!diente) {
        return (
            <p className="text-sm text-gray-400 font-sans">
            Selecciona un diente para ver su estado.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
            <p className="text-xs font-sans font-bold text-gray-400 uppercase mb-1">Diente</p>
            <p className="font-sans font-semibold text-gray-900">
                {diente.numero_fdi} — {diente.nombre}
            </p>
            </div>

            <div>
            <p className="text-xs font-sans font-bold text-gray-400 uppercase mb-1">Estado actual</p>
            {diente.estadoActual ? (
                <span
                    className="inline-flex items-center gap-2 text-sm font-sans font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${diente.estadoActual.color}20`, color: diente.estadoActual.color }}
                >
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: diente.estadoActual.color }}
                    />
                    {diente.estadoActual.nombre}
                </span>
            ) : (
                <p className="text-sm text-gray-400 font-sans">Sin registro todavía</p>
            )}
            </div>

            <div>
            <p className="text-xs font-sans font-bold text-gray-400 uppercase mb-1">Observaciones más recientes</p>
            <p className="text-sm font-sans text-gray-700">
                {diente.estadoActual?.observaciones || "Sin observaciones registradas"}
            </p>
            </div>

            {diente.estadoActual?.fecha_registro && (
            <p className="text-xs text-gray-400 font-sans">
                Registrado el{" "}
                {new Date(diente.estadoActual.fecha_registro).toLocaleDateString("es-HN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}
            </p>
            )}
        </div>
    );
}