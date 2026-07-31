// Diente.tsx
'use client';
import type { DienteConEstado } from './odontograma.types';
import { calcularPosicion } from './odontograma.config';

const COLOR_CELESTE = '#86d0f0';
const COLOR_ROJO = '#EF4444';

const ANCHO = 45;
const ALTO = 60;
const TOOTH_PATH =
  'M22,3 C13,3 7,9 7,18 C7,26 9,31 12,37 L15,45 C17,50 19,54 22,56 C25,54 27,50 29,45 L32,37 C35,31 37,26 37,18 C37,9 31,3 22,3 Z';

export function Diente({ diente }: { diente: DienteConEstado }) {
  const { x, y } = calcularPosicion(diente.cuadrante, diente.posicion);

  // 1. Extraemos el color que viene directo de la tabla de estados en tu BD
  const colorBD = diente.estadoActual?.color;
  
  // 2. Si trae un color (negro, gris, rojo, etc.), usa ese. Si viene vacío/nulo, usa celeste.
  let colorFinal = colorBD ? colorBD : COLOR_CELESTE;

  // 3. Mantenemos tu regla de "malo" por si alguna vez el color en la BD está vacío pero el nombre es "malo"
  if (diente.estadoActual?.nombre?.toLowerCase() === 'malo') {
    colorFinal = COLOR_ROJO;
  }

  return (
    <g transform={`translate(${x},${y})`} data-fdi={diente.numero_fdi}>
      
      {/* MAGIA AQUÍ: Esta etiqueta crea el tooltip automáticamente */}
      <title>{`Diente ${diente.numero_fdi} - ${diente.nombre || 'Nombre no disponible'}`}</title>
      
      <path d={TOOTH_PATH} fill={colorFinal} stroke="#374151" strokeWidth={1.5} />
      <text x={ANCHO / 2} y={ALTO + 14} textAnchor="middle" fontSize={10}>
        {diente.numero_fdi}
      </text>
    </g>
  );
}