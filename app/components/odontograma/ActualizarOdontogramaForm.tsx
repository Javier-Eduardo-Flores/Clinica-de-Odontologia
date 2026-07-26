// app/components/odontograma/ActualizarOdontogramaForm.tsx
"use client";

import { useActionState } from "react";
import { actualizarOdontograma } from "@/app/actions/odontograma";

interface DienteOpcion {
  id_diente: string;
  numero_fdi: number;
  nombre: string;
}

interface EstadoOpcion {
  id_estado_diente: string;
  nombre: string;
  color: string | null;
}

interface Props {
  idPaciente: string;
  dientes: DienteOpcion[];
  estados: EstadoOpcion[];
}

export default function ActualizarOdontogramaForm({ idPaciente, dientes, estados }: Props) {
  const [state, formAction, pending] = useActionState(actualizarOdontograma, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id_paciente" value={idPaciente} />

      {state && "error" in state && (
        <p className="text-red-500 text-sm font-sans">{state.error}</p>
      )}
      {state && "success" in state && state.success && (
        <p className="text-green-600 text-sm font-sans">Odontograma actualizado correctamente.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="id_diente">
            Diente
          </label>
          <select
            id="id_diente"
            name="id_diente"
            required
            className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
          >
            <option value="">Selecciona un diente</option>
            {dientes.map((d) => (
              <option key={d.id_diente} value={d.id_diente}>
                {d.numero_fdi} — {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="id_estado_diente">
            Nuevo estado
          </label>
          <select
            id="id_estado_diente"
            name="id_estado_diente"
            required
            className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
          >
            <option value="">Selecciona un estado</option>
            {estados.map((e) => (
              <option key={e.id_estado_diente} value={e.id_estado_diente}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="observaciones">
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={2}
          placeholder="Ej. Caries superficial, requiere obturación en próxima cita..."
          className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit font-sans font-bold bg-clinica-dark text-white px-6 py-2.5 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
      >
        {pending ? "Guardando..." : "Registrar Estado"}
      </button>
    </form>
  );
}