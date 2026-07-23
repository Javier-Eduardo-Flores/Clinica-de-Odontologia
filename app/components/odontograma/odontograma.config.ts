// odontograma.config.ts
// Convierte (cuadrante, posicion) en coordenadas. Cero datos clínicos aquí.

const ANCHO_PIEZA = 45;
const ESPACIADO = 4;
const Y_FILA_SUPERIOR = 40;
const Y_FILA_INFERIOR = 160;
const X_LINEA_MEDIA = 400;

export function calcularPosicion(cuadrante: number, posicion: number) {
  const esSuperior = cuadrante === 1 || cuadrante === 2;
  const esLadoDerechoPaciente = cuadrante === 1 || cuadrante === 4;

  // posicion 1 (incisivo central) = más cerca de la línea media
  // posicion 8 (tercer molar) = más lejos
  const distancia = (posicion - 1) * (ANCHO_PIEZA + ESPACIADO) + ANCHO_PIEZA / 2;

  // Convención clínica: el lado derecho del PACIENTE se dibuja a la
  // izquierda de la imagen (como mirándolo de frente, igual que una
  // radiografía). Es la fuente #1 de bugs si se ignora.
  const x = esLadoDerechoPaciente ? X_LINEA_MEDIA - distancia : X_LINEA_MEDIA + distancia;
  const y = esSuperior ? Y_FILA_SUPERIOR : Y_FILA_INFERIOR;

  return { x, y };
}