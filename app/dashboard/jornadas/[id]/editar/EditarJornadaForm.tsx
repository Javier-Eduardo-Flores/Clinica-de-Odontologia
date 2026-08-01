"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { editarJornada } from "@/app/actions/jornadas";
import Input from "@/Components/UI/Input";

export default function EditarJornadaForm({
  jornada,
}: {
  jornada: { id_jornada: string; nombre: string; hora_inicio: string; hora_fin: string };
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(editarJornada, null);
  const [nombre, setNombre] = useState(jornada.nombre);
  const [horaInicio, setHoraInicio] = useState(jornada.hora_inicio.slice(0, 5));
  const [horaFin, setHoraFin] = useState(jornada.hora_fin.slice(0, 5));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state && "success" in state) {
      router.push("/dashboard/jornadas");
    }
    if (state && "error" in state) {
      setError(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id_jornada" value={jornada.id_jornada} />
      <Input
        type="text"
        label="Nombre de la jornada"
        name="nombre"
        placeholder="Ej: Matutina"
        required
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setError(null); }}
        onBlur={() => {}}
        error={error ?? undefined}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="time"
          label="Hora de inicio"
          name="hora_inicio"
          placeholder="08:00"
          required
          value={horaInicio}
          onChange={(e) => { setHoraInicio(e.target.value); setError(null); }}
          onBlur={() => {}}
        />
        <Input
          type="time"
          label="Hora de fin"
          name="hora_fin"
          placeholder="12:00"
          required
          value={horaFin}
          onChange={(e) => { setHoraFin(e.target.value); setError(null); }}
          onBlur={() => {}}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 font-sans">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-clinica-dark text-white font-sans font-semibold py-2.5 rounded-lg hover:bg-clinica-medium transition-colors disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
