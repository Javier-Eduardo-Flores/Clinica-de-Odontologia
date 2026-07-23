// Diente.tsx
'use client';

import type { DienteConEstado } from './odontograma.types';
import { calcularPosicion } from './odontograma.config';

const COLOR_SIN_REGISTRO = '#E5E7EB'; // gris neutro: distinto de "Sano" a propósito

const ANCHO = 45;
const ALTO = 60;

export function Diente({ diente }: { diente: DienteConEstado }) {
  const { x, y } = calcularPosicion(diente.cuadrante, diente.posicion);
  const color = diente.estadoActual?.color ?? COLOR_SIN_REGISTRO;

  return (
    <g transform={`translate(${x}, ${y})`} data-fdi={diente.numero_fdi}>
      <rect width={ANCHO} height={ALTO} rx={8} fill={color} stroke="#374151" strokeWidth={1.5} />
      <text x={ANCHO / 2} y={ALTO + 14} textAnchor="middle" fontSize={10}>
        {diente.numero_fdi}
      </text>
    </g>
  );
}