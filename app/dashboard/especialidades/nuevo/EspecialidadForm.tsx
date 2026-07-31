"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearEspecialidad } from "@/app/actions/especialidades";
import Input from "@/Components/UI/Input";
import Textarea from "@/Components/UI/Textarea";

export default function EspecialidadForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(crearEspecialidad, null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state && "success" in state) {
      router.push("/dashboard/especialidades");
    }
    if (state && "error" in state) {
      setError(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <Input
        type="text"
        label="Nombre de la especialidad"
        name="nombre"
        placeholder="Ej: Ortodoncia"
        required
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setError(null); }}
        onBlur={() => {}}
        error={error ?? undefined}
      />

      <Textarea
        label="Descripción"
        name="descripcion"
        placeholder="Ej: Corrección de malposiciones dentales con brackets y alineadores."
        required={false}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      {error && (
        <p className="text-sm text-red-600 font-sans">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-clinica-dark text-white font-sans font-semibold py-2.5 rounded-lg hover:bg-clinica-medium transition-colors disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Especialidad"}
      </button>
    </form>
  );
}
