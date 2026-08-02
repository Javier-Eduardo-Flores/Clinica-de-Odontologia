// app/components/citas/CitaFormStaff.tsx
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { agendarCitaStaff } from "@/app/actions/citas";
import { obtenerHorasDisponibles } from "@/app/actions/horarios";
import { Calendar, Clock, Stethoscope, UserCircle, User } from "lucide-react";

interface Tratamiento {
  id_tratamiento: string;
  nombre: string;
  precio: number;
  id_especialidad: string | null;
}

interface Especialidad {
  id_especialidad: string;
  nombre: string;
}

interface Odontologo {
  id_odontologo: string;
  primer_nombre: string;
  primer_apellido: string;
  especialidades: Especialidad[];
}

interface Paciente {
  id_paciente: string;
  primer_nombre: string;
  primer_apellido: string;
  dni: string;
}

interface Props {
  tratamientos: Tratamiento[];
  odontologos: Odontologo[];
  pacientes: Paciente[];
}

export default function CitaFormStaff({ tratamientos, odontologos, pacientes }: Props) {
  const [state, formAction, pending] = useActionState(agendarCitaStaff, null);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>("");
  const [fecha, setFecha] = useState("");
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<string>("");
  const [odontologoSeleccionado, setOdontologoSeleccionado] = useState<string>("");
  const [hora, setHora] = useState<string>("");

  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [mensajeHorario, setMensajeHorario] = useState<string>("");
  const [cargandoHoras, startTransition] = useTransition();

  const hoy = new Date().toISOString().split("T")[0];

  const tratamientoActual = tratamientos.find(t => t.id_tratamiento === tratamientoSeleccionado);

  const odontologosFiltrados = tratamientoActual
    ? tratamientoActual.id_especialidad === null
      ? odontologos
      : odontologos.filter(doc =>
          doc.especialidades.some(e => e.id_especialidad === tratamientoActual.id_especialidad)
        )
    : [];

  useEffect(() => {
    setOdontologoSeleccionado((actual) =>
      actual && !odontologosFiltrados.some((o) => o.id_odontologo === actual) ? "" : actual
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tratamientoSeleccionado]);

  useEffect(() => {
    setHora("");

    if (!fecha || !odontologoSeleccionado) {
      setHorasDisponibles([]);
      setMensajeHorario("");
      return;
    }

    let cancelado = false;

    startTransition(async () => {
      const res = await obtenerHorasDisponibles(odontologoSeleccionado, fecha);
      if (cancelado) return;

      if ("error" in res) {
        setHorasDisponibles([]);
        setMensajeHorario(res.error);
        return;
      }

      setHorasDisponibles(res.horas);
      setMensajeHorario(res.mensaje);
    });

    return () => {
      cancelado = true;
    };
  }, [fecha, odontologoSeleccionado]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && "error" in state && (
        <p className="text-red-500 text-sm font-sans text-center">{state.error}</p>
      )}

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="id_paciente">
          Paciente
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            id="id_paciente"
            name="id_paciente"
            required
            value={pacienteSeleccionado}
            onChange={(e) => setPacienteSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white"
          >
            <option value="" disabled>Selecciona un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id_paciente} value={p.id_paciente}>
                {p.primer_nombre} {p.primer_apellido} — {p.dni}
              </option>
            ))}
          </select>
        </div>
      </div>

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
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1" htmlFor="id_tratamiento">
          Motivo de la cita
        </label>
        <div className="relative">
          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            id="id_tratamiento"
            name="id_tratamiento"
            required
            value={tratamientoSeleccionado}
            onChange={(e) => setTratamientoSeleccionado(e.target.value)}
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
            disabled={!tratamientoSeleccionado}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="" disabled>
              {!tratamientoSeleccionado
                ? "Primero selecciona un tratamiento"
                : "Selecciona un odontólogo"}
            </option>
            {odontologosFiltrados.map((o) => (
              <option key={o.id_odontologo} value={o.id_odontologo}>
                Dr(a). {o.primer_nombre} {o.primer_apellido}
              </option>
            ))}
          </select>
        </div>

        {tratamientoSeleccionado && odontologosFiltrados.length === 0 && (
          <p className="text-orange-500 text-xs mt-1">No hay odontólogos registrados con esta especialidad todavía.</p>
        )}
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

      <button
        type="submit"
        disabled={pending || !pacienteSeleccionado || !tratamientoSeleccionado || !odontologoSeleccionado || !hora}
        className="font-sans font-bold bg-clinica-dark text-white py-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors mt-2"
      >
        {pending ? "Agendando..." : "Agendar Cita"}
      </button>
    </form>
  );
}