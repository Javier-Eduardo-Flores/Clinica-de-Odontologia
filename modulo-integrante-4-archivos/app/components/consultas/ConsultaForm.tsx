"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import Textarea from "@/Components/UI/Textarea";
import { registrarConsulta, type ConsultaState } from "@/app/actions/consultas";
import type { CitaParaConsulta } from "@/app/actions/consultas";

type Tratamiento = { id_tratamiento: string; nombre: string; precio: number };

type FilaTratamiento = {
  key: string;
  id_tratamiento: string;
  cantidad: number;
  notas: string;
};

const nuevaFila = (): FilaTratamiento => ({
  key: crypto.randomUUID(),
  id_tratamiento: "",
  cantidad: 1,
  notas: "",
});

export default function ConsultaForm({
  citas,
  tratamientos,
}: {
  citas: CitaParaConsulta[];
  tratamientos: Tratamiento[];
}) {
  const router = useRouter();
  const [filas, setFilas] = useState<FilaTratamiento[]>([nuevaFila()]);
  const [state, formAction, isPending] = useActionState<ConsultaState, FormData>(registrarConsulta, null);

  if (state && "success" in state && state.success) {
    router.push("/dashboard/consultas/nueva");
  }

  const actualizarFila = (key: string, cambios: Partial<FilaTratamiento>) => {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, ...cambios } : f)));
  };

  const agregarFila = () => setFilas((prev) => [...prev, nuevaFila()]);
  const quitarFila = (key: string) =>
    setFilas((prev) => (prev.length > 1 ? prev.filter((f) => f.key !== key) : prev));

  const handleSubmit = (formData: FormData) => {
    const tratamientosPayload = filas
      .filter((f) => f.id_tratamiento)
      .map((f) => ({ id_tratamiento: f.id_tratamiento, cantidad: f.cantidad, notas: f.notas }));
    formData.set("tratamientos", JSON.stringify(tratamientosPayload));
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5">
      {state && "error" in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}
      {state && "success" in state && state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-sans rounded-lg px-4 py-3">
          Consulta registrada correctamente.
        </div>
      )}

      <div>
        <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1" htmlFor="id_cita">
          Cita asociada
        </label>
        <select
          id="id_cita"
          name="id_cita"
          required
          className="w-full border border-gray-300 rounded-lg py-2 px-2 focus:outline-none focus:ring-2 focus:ring-clinica-dark"
        >
          <option value="">Selecciona una cita pendiente…</option>
          {citas.map((c) => (
            <option key={c.id_cita} value={c.id_cita}>
              {c.paciente_nombre} — {new Date(c.fecha_cita).toLocaleString("es-HN")}
              {c.motivo ? ` (${c.motivo})` : ""}
            </option>
          ))}
        </select>
        {citas.length === 0 && (
          <p className="text-xs text-gray-400 font-sans mt-1">
            No tienes citas pendientes de consulta en tu agenda.
          </p>
        )}
      </div>

      <Textarea
        label="Diagnóstico"
        name="diagnostico"
        placeholder="Describe el diagnóstico del paciente…"
        required={false}
      />

      <Textarea
        label="Evolución"
        name="evolucion"
        placeholder="Describe la evolución observada en esta sesión…"
        required={false}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-inter font-semibold text-clinica-accent">
            Tratamientos realizados
          </label>
          <button
            type="button"
            onClick={agregarFila}
            className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-clinica-dark hover:underline"
          >
            <Plus size={16} /> Agregar Tratamiento
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {filas.map((fila) => (
            <div key={fila.key} className="grid grid-cols-12 gap-2 items-start border border-gray-100 rounded-lg p-3">
              <select
                value={fila.id_tratamiento}
                onChange={(e) => actualizarFila(fila.key, { id_tratamiento: e.target.value })}
                className="col-span-6 border border-gray-300 rounded-lg py-2 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-dark"
              >
                <option value="">Servicio…</option>
                {tratamientos.map((t) => (
                  <option key={t.id_tratamiento} value={t.id_tratamiento}>
                    {t.nombre}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={fila.cantidad}
                onChange={(e) => actualizarFila(fila.key, { cantidad: Number(e.target.value) })}
                className="col-span-2 border border-gray-300 rounded-lg py-2 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-dark"
              />

              <input
                type="text"
                placeholder="Notas (opcional)"
                value={fila.notas}
                onChange={(e) => actualizarFila(fila.key, { notas: e.target.value })}
                className="col-span-3 border border-gray-300 rounded-lg py-2 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinica-dark"
              />

              <button
                type="button"
                onClick={() => quitarFila(fila.key)}
                disabled={filas.length === 1}
                className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 py-2"
                aria-label="Quitar tratamiento"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2.5 rounded-lg hover:bg-clinica-medium disabled:opacity-60 self-start"
      >
        {isPending ? "Guardando…" : "Guardar Consulta"}
      </button>
    </form>
  );
}
