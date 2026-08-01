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

export function Diente({
  diente,
  seleccionado,
  onSeleccionar,
}: {
  diente: DienteConEstado;
  seleccionado: boolean;
  onSeleccionar: (diente: DienteConEstado) => void;
}) {
  const { x, y } = calcularPosicion(diente.cuadrante, diente.posicion);

  const colorBD = diente.estadoActual?.color;

  let colorFinal = colorBD ? colorBD : COLOR_CELESTE;

  if (diente.estadoActual?.nombre?.toLowerCase() === 'malo') {
    colorFinal = COLOR_ROJO;
  }

  return (
    <g
      transform={`translate(${x},${y})`}
      data-fdi={diente.numero_fdi}
      onClick={() => onSeleccionar(diente)}
      className="cursor-pointer"
    >
      {/* Esta etiqueta crea el tooltip automáticamente al pasar el mouse */}
      <title>{`Diente ${diente.numero_fdi} - ${diente.nombre || 'Nombre no disponible'}`}</title>

      <path
        d={TOOTH_PATH}
        fill={colorFinal}
        stroke={seleccionado ? '#0C2B4E' : '#374151'}
        strokeWidth={seleccionado ? 3 : 1.5}
      />
      <text x={ANCHO / 2} y={ALTO + 14} textAnchor="middle" fontSize={10}>
        {diente.numero_fdi}
      </text>
    </g>
  );
}