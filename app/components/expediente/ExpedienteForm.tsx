// app/components/expediente/ExpedienteForm.tsx
"use client";

import { useActionState } from "react";
import { guardarExpediente } from "@/app/actions/expediente";

interface Props {
  idPaciente: string;
  medicamentosIniciales: string | null;
  observacionesIniciales: string | null;
  actualizadoEn?: string | null;
}

export default function ExpedienteForm({ idPaciente, medicamentosIniciales, observacionesIniciales, actualizadoEn }: Props) {
  const [state, formAction, pending] = useActionState(guardarExpediente, null);

  const fechaMostrada = state && "success" in state && state.success
    ? new Date()
    : actualizadoEn
    ? new Date(actualizadoEn)
    : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id_paciente" value={idPaciente} />

      {fechaMostrada && (
        <p className="text-xs text-gray-400 font-sans">
          Última actualización:{" "}
          {fechaMostrada.toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      )}

      {state && "error" in state && (
        <p className="text-red-500 text-sm font-sans">{state.error}</p>
      )}
      {state && "success" in state && state.success && (
        <p className="text-green-600 text-sm font-sans">Expediente guardado correctamente.</p>
      )}

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="medicamentos_actuales">
          Medicamentos actuales (opcional)
        </label>
        <textarea
          id="medicamentos_actuales"
          name="medicamentos_actuales"
          rows={2}
          defaultValue={medicamentosIniciales ?? ""}
          placeholder="Ej. Ninguno, o lista de medicamentos que toma actualmente..."
          className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="observaciones">
          Observaciones generales <span className="text-red-500">*</span>
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          required
          rows={3}
          defaultValue={observacionesIniciales ?? ""}
          placeholder="Alergias, condiciones médicas relevantes, notas generales del paciente..."
          className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit font-sans font-bold bg-clinica-dark text-white px-6 py-2.5 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
      >
        {pending ? "Guardando..." : "Guardar Expediente"}
      </button>
    </form>
  );
}