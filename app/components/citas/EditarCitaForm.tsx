// app/components/citas/EditarCitaForm.tsx
"use client";

import { useActionState } from "react";
import { modificarCita } from "@/app/actions/citas";
import { Calendar, Clock, FileText } from "lucide-react";

interface Props {
  idCita: string;
  fechaInicial: string; // "2026-08-15"
  horaInicial: string;  // "10:30"
  motivoInicial: string;
}

export default function EditarCitaForm({ idCita, fechaInicial, horaInicial, motivoInicial }: Props) {
  const [state, formAction, pending] = useActionState(modificarCita, null);

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id_cita" value={idCita} />

      {state && "error" in state && (
        <p className="text-red-500 text-sm font-sans text-center">{state.error}</p>
      )}

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="fecha">
          Fecha
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            min={hoy}
            defaultValue={fechaInicial}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="hora">
          Hora
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="hora"
            name="hora"
            type="time"
            required
            defaultValue={horaInicial}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="motivo">
          Motivo de la cita
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
          <textarea
            id="motivo"
            name="motivo"
            required
            rows={3}
            defaultValue={motivoInicial}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="font-sans font-bold bg-clinica-dark text-white py-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
      >
        {pending ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}