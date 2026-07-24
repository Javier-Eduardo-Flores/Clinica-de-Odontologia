import { AlertTriangle, Pill, HeartPulse } from "lucide-react";
import type { ExpedienteData } from "./expediente.types";

/**
 * Banner de alerta médica. Pensado para incrustarse en la vista general
 * del paciente (p. ej. /dashboard/pacientes/[id], propiedad del
 * Integrante 1) y también se usa en /dashboard/expediente.
 *
 * Uso:
 *   const expediente = await obtenerExpediente(idPaciente);
 *   <AlertaMedica expediente={expediente} />
 */
export default function AlertaMedica({ expediente }: { expediente: ExpedienteData | null }) {
  const tieneAlertas =
    !!expediente?.alergias || !!expediente?.patologias_previas || !!expediente?.medicacion_habitual;

  if (!expediente || !tieneAlertas) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
        <HeartPulse size={20} className="text-gray-400 shrink-0" />
        <p className="text-sm text-gray-500 font-sans">
          Sin alergias, patologías o medicación registradas en el expediente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0" />
        <h3 className="font-sans font-bold text-amber-800">Alerta Médica</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {expediente.alergias && (
          <div>
            <p className="text-xs font-sans font-semibold text-amber-700 uppercase mb-1">Alergias</p>
            <p className="text-sm text-amber-900 font-sans">{expediente.alergias}</p>
          </div>
        )}
        {expediente.patologias_previas && (
          <div>
            <p className="text-xs font-sans font-semibold text-amber-700 uppercase mb-1">
              Patologías previas
            </p>
            <p className="text-sm text-amber-900 font-sans">{expediente.patologias_previas}</p>
          </div>
        )}
        {expediente.medicacion_habitual && (
          <div className="flex gap-2">
            <Pill size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-sans font-semibold text-amber-700 uppercase mb-1">
                Medicación habitual
              </p>
              <p className="text-sm text-amber-900 font-sans">{expediente.medicacion_habitual}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
