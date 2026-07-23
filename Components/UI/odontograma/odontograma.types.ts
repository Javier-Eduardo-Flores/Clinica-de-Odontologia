export interface DienteConEstado {
  id_diente: string;
  numero_fdi: number;
  cuadrante: number;
  posicion: number;
  nombre: string;
  estadoActual: {
    id_estado_diente: string;
    nombre: string;
    color: string;
  } | null;
}