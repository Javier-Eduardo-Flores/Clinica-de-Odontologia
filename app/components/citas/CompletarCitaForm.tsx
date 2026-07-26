// app/components/citas/CompletarCitaForm.tsx
"use client";

import { useActionState } from "react";
import { completarCitaConConsulta } from "@/app/actions/citas";

export default function CompletarCitaForm({ idCita }: { idCita: string }) {
  const [state, formAction, pending] = useActionState(completarCitaConConsulta, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id_cita" value={idCita} />

      {state?.error && <p className="text-red-500 text-sm font-sans">{state.error}</p>}

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="diagnostico">
          Diagnóstico <span className="text-red-500">*</span>
        </label>
        <textarea
          id="diagnostico"
          name="diagnostico"
          required
          rows={2}
          placeholder="Ej. Caries en pieza 36, se recomienda obturación..."
          className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="observaciones">
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={2}
          placeholder="Notas adicionales de la consulta..."
          className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit font-sans font-bold bg-clinica-dark text-white px-6 py-2.5 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
      >
        {pending ? "Guardando..." : "Marcar como Completada"}
      </button>
    </form>
  );
}