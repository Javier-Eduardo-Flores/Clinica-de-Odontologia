// app/components/citas/EditarCitaForm.tsx
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { modificarCita } from "@/app/actions/citas";
import { obtenerHorasDisponibles } from "@/app/actions/horarios";
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
  idCita: string;
  fechaInicial: string;
  horaInicial: string;
  idTratamientoInicial: string | null;
  idOdontologoInicial: string | null;
  tratamientos: Tratamiento[];
  odontologos: Odontologo[];
}

export default function EditarCitaForm({
  idCita,
  fechaInicial,
  horaInicial,
  idTratamientoInicial,
  idOdontologoInicial,
  tratamientos,
  odontologos,
}: Props) {
  const [state, formAction, pending] = useActionState(modificarCita, null);

  const [fecha, setFecha] = useState(fechaInicial);
  const [odontologoSeleccionado, setOdontologoSeleccionado] = useState(idOdontologoInicial ?? "");
  const [hora, setHora] = useState(horaInicial);

  // La hora original de la cita siempre cuenta como disponible mientras no
  // se cambie fecha u odontólogo, aunque ya haya "pasado" el bloqueo de 30 min contra sí misma.
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>(
    horaInicial ? [horaInicial] : []
  );
  const [mensajeHorario, setMensajeHorario] = useState<string>("");
  const [cargandoHoras, startTransition] = useTransition();

  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!fecha || !odontologoSeleccionado) {
      setHorasDisponibles([]);
      setMensajeHorario("");
      return;
    }

    let cancelado = false;

    startTransition(async () => {
      const res = await obtenerHorasDisponibles(odontologoSeleccionado, fecha, idCita);
      if (cancelado) return;

      if ("error" in res) {
        setHorasDisponibles([]);
        setMensajeHorario(res.error);
        return;
      }

      // Si la fecha/odontólogo no cambiaron respecto a los valores iniciales,
      // aseguramos que la hora original siga apareciendo en la lista.
      const horas =
        fecha === fechaInicial &&
        odontologoSeleccionado === idOdontologoInicial &&
        horaInicial &&
        !res.horas.includes(horaInicial)
          ? [...res.horas, horaInicial].sort()
          : res.horas;

      setHorasDisponibles(horas);
      setMensajeHorario(res.mensaje);

      if (hora && !horas.includes(hora)) {
        setHora("");
      }
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, odontologoSeleccionado]);

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
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
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
            value={odontologoSeleccionado}
            onChange={(e) => setOdontologoSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white"
          >
            <option value="">Selecciona un odontólogo</option>
            {odontologos.map((o) => (
              <option key={o.id_odontologo} value={o.id_odontologo}>
                Dr(a). {o.primer_nombre} {o.primer_apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="hora">
          Hora
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            id="hora"
            name="hora"
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            disabled={!fecha || !odontologoSeleccionado || cargandoHoras || horasDisponibles.length === 0}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="" disabled>
              {!fecha || !odontologoSeleccionado
                ? "Selecciona fecha y odontólogo primero"
                : cargandoHoras
                ? "Buscando horas disponibles..."
                : horasDisponibles.length === 0
                ? "Sin horas disponibles"
                : "Selecciona una hora"}
            </option>
            {horasDisponibles.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {mensajeHorario && !cargandoHoras && (
          <p className="text-orange-500 text-xs mt-1">{mensajeHorario}</p>
        )}
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
            defaultValue={idTratamientoInicial ?? ""}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white"
          >
            <option value="">Selecciona un tratamiento</option>
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
        disabled={pending || !hora}
        className="font-sans font-bold bg-clinica-dark text-white py-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
      >
        {pending ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}