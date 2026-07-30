export interface ExpedienteData {
  id_expediente: string;
  id_paciente: string;
  alergias: string | null;
  patologias_previas: string | null;
  medicacion_habitual: string | null;
  notas_generales: string | null;
  fecha_actualizacion: string;
}
