// app/actions/obtener-dientes.ts
import { createClient } from '@/utils/supabase/server'; 
import type { DienteConEstado } from '@/app/components/odontograma/odontograma.types';

export async function obtenerDientesConEstado(idPaciente: string): Promise<DienteConEstado[]> {
  const supabase = await createClient();

  const [{ data: dientes, error: errorDientes }, { data: estados, error: errorEstados }] = await Promise.all([
    supabase
      .from('diente')
      .select('id_diente, numero_fdi, cuadrante, posicion, nombre')
      .order('numero_fdi'),
    supabase
      .from('vista_odontograma_actual')
      .select('id_diente, id_estado_diente, estado_nombre, color')
      .eq('id_paciente', idPaciente),
  ]);

  if (errorDientes) throw errorDientes;
  if (errorEstados) throw errorEstados;

  const estadoPorDiente = new Map((estados ?? []).map((e) => [e.id_diente, e]));

  return (dientes ?? []).map((diente) => {
    const estado = estadoPorDiente.get(diente.id_diente);
    return {
      ...diente,
      estadoActual: estado
        ? { id_estado_diente: estado.id_estado_diente, nombre: estado.estado_nombre, color: estado.color }
        : null,
    };
  });
}