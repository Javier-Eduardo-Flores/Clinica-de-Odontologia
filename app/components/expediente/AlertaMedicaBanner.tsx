// app/components/expediente/AlertaMedicaBanner.tsx
import { AlertTriangle, Pill } from "lucide-react";

interface Props {
  medicamentos: string | null;
  observaciones: string | null;
}

/**
 * Banner superior de alerta médica: destaca alergias/patologías
 * (observaciones) y medicación habitual del expediente para que el
 * odontólogo las vea de inmediato al abrir el expediente del paciente.
 */
export default function AlertaMedicaBanner({ medicamentos, observaciones }: Props) {
  const tieneObservaciones = !!observaciones?.trim();
  const tieneMedicamentos = !!medicamentos?.trim();

  if (!tieneObservaciones && !tieneMedicamentos) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
      <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-sans font-bold text-red-700 uppercase tracking-wide">
          Alerta Médica — Antecedentes del Paciente
        </p>

        {tieneObservaciones && (
          <p className="text-sm font-sans text-red-800">
            <span className="font-semibold">Alergias / condiciones registradas:</span> {observaciones}
          </p>
        )}

        {tieneMedicamentos && (
          <p className="text-sm font-sans text-red-800 flex items-start gap-1.5">
            <Pill size={14} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold">Medicación habitual:</span> {medicamentos}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
