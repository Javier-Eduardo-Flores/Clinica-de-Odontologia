"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { iconoParaNombre } from "./iconosTratamiento";

const MAX_INICIAL = 6;

type TratamientoLite = {
  id_tratamiento: string;
  nombre: string;
  descripcion: string | null;
};

export default function TratamientosGrid({
  tratamientos,
}: {
  tratamientos: TratamientoLite[];
}) {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const visibles = mostrarTodos
    ? tratamientos
    : tratamientos.slice(0, MAX_INICIAL);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibles.map((t, i) => {
          const Icono = iconoParaNombre(t.nombre, i);
          return (
            <div
              key={t.id_tratamiento}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-clinica-light flex items-center justify-center mb-4">
                <Icono size={26} className="text-clinica-accent" />
              </div>
              <h3 className="font-bold text-clinica-dark mb-2">{t.nombre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.descripcion ||
                  "Consulta en nuestra clínica para más información."}
              </p>
            </div>
          );
        })}
      </div>

      {tratamientos.length > MAX_INICIAL && (
        <div className="text-center mt-8">
          <button
            onClick={() => setMostrarTodos((v) => !v)}
            className="inline-flex items-center gap-2 border border-clinica-accent text-clinica-accent px-6 py-2.5 rounded-lg font-semibold hover:bg-clinica-accent hover:text-white transition-colors cursor-pointer"
          >
            {mostrarTodos ? "Mostrar menos" : "Mostrar más"}
            <ChevronDown
              size={18}
              className={
                mostrarTodos
                  ? 'rotate-180 transition-transform'
                  : 'transition-transform'
              }
            />
          </button>
        </div>
      )}
    </>
  );
}
