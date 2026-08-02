// Odontograma.tsx
'use client';

import type { DienteConEstado } from './odontograma.types';
import { Diente } from './Diente';

export function Odontograma({
  dientes,
  seleccionado,
  onSeleccionar,
}: {
  dientes: DienteConEstado[];
  seleccionado?: DienteConEstado | null;
  onSeleccionar?: (diente: DienteConEstado) => void;
}) {
  return (
    <svg viewBox="0 0 820 260" className="w-full h-auto">
      {dientes.map((diente) => (
        <Diente
          key={diente.id_diente}
          diente={diente}
          seleccionado={seleccionado?.id_diente === diente.id_diente}
          onSeleccionar={onSeleccionar ?? (() => {})}
        />
      ))}
    </svg>
  );
}  