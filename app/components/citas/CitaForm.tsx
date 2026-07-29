// app/components/citas/CitaForm.tsx
"use client";

import { useActionState } from "react";
import { agendarCita } from "@/app/actions/citas";
import { Calendar, Clock, Stethoscope, UserCircle } from "lucide-react";

interface Tratamiento {
  id_tratamiento: string;
  nombre: string;
  precio: number;
}

interface Odontologo {
  id_odontologo: string;
  primer_nombre: string;
  primer_apellido: string;
}

interface Props {
  tratamientos: Tratamiento[];
  odontologos: Odontologo[];
}

export default function CitaForm({ tratamientos, odontologos }: Props) {
  const [state, formAction, pending] = useActionState(agendarCita, null);

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="id_odontologo">
          Odontólogo asignado
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            id="id_odontologo"
            name="id_odontologo"
            required
            defaultValue=""
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white"
          >
            <option value="" disabled>Selecciona un odontólogo</option>
            {odontologos.map((o) => (
              <option key={o.id_odontologo} value={o.id_odontologo}>
                Dr(a). {o.primer_nombre} {o.primer_apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="id_tratamiento">
          Motivo de la cita
        </label>
        <div className="relative">
          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            id="id_tratamiento"
            name="id_tratamiento"
            required
            defaultValue=""
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white"
          >
            <option value="" disabled>Selecciona un tratamiento</option>
            {tratamientos.map((t) => (
              <option key={t.id_tratamiento} value={t.id_tratamiento}>
                {t.nombre} — L. {Number(t.precio).toLocaleString("es-HN")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="font-sans font-bold bg-clinica-dark text-white py-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
      >
        {pending ? "Agendando..." : "Confirmar Cita"}
      </button>
    </form>
  );
} 