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
  observaciones: string | null;
  fecha_registro: string | null;
} | null;

export interface DienteConEstado extends DienteInfo {
  estadoActual: EstadoActual;
}