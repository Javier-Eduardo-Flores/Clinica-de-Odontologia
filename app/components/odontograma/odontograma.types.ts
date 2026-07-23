// odontograma.types.ts
export type DienteInfo = {
  id_diente: string;
  numero_fdi: number;
  cuadrante: number;
  posicion: number;
  nombre: string;
};

export type EstadoActual = {
  id_estado_diente: string;
  nombre: string;
  color: string;
} | null; // null = sin registro en odontograma todavía

export interface DienteConEstado extends DienteInfo {
  estadoActual: EstadoActual;
}