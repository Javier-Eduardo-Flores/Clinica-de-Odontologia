// Diente.tsx
'use client';

import type { DienteConEstado } from './odontograma.types';
import { calcularPosicion } from './odontograma.config';

const COLOR_SIN_REGISTRO = '#38BDF8'; // gris neutro: distinto de "Sano" a propósito

const ANCHO = 45;
const ALTO = 60;

const TOOTH_PATH =
  'M22,3 C13,3 7,9 7,18 C7,26 9,31 12,37 L15,45 C17,50 19,54 22,56 C25,54 27,50 29,45 L32,37 C35,31 37,26 37,18 C37,9 31,3 22,3 Z';

export function Diente({ diente }: { diente: DienteConEstado }) {
  const { x, y } = calcularPosicion(diente.cuadrante, diente.posicion);
  const color = diente.estadoActual?.color ?? COLOR_SIN_REGISTRO;

  return (
    <g transform={`translate(${x}, ${y})`} data-fdi={diente.numero_fdi}>
      <path d={TOOTH_PATH} fill={color} stroke="#374151" strokeWidth={1.5} />
      <text x={ANCHO / 2} y={ALTO + 14} textAnchor="middle" fontSize={10}>
        {diente.numero_fdi}
      </text>
    </g>
  );
}