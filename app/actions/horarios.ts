// app/actions/horarios.ts
"use server";

import { createClient } from "@/utils/supabase/server";

const DURACION_MIN = 30; // duración mínima entre citas / tamaño de cada bloque

export type HorasDisponiblesResult =
  | { error: string }
  | { atiende: false; horas: []; mensaje: string }
  | { atiende: true; horas: string[]; mensaje: string };

/**
 * Convierte una fecha "YYYY-MM-DD" a día de la semana en formato 1..7
 * (1 = Lunes ... 7 = Domingo), igual que la tabla odontologos_jornadas.
 */
function diaSemanaISO(fecha: string): number {
  const [y, m, d] = fecha.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Domingo ... 6 = Sábado
  return dow === 0 ? 7 : dow;
}

/** Genera bloques de hora "HH:MM" entre hora_inicio y hora_fin, cada DURACION_MIN. */
function generarBloques(horaInicio: string, horaFin: string): string[] {
  const [hi, mi] = horaInicio.slice(0, 5).split(":").map(Number);
  const [hf, mf] = horaFin.slice(0, 5).split(":").map(Number);

  const inicioMin = hi * 60 + mi;
  const finMin = hf * 60 + mf;

  const bloques: string[] = [];
  for (let t = inicioMin; t + DURACION_MIN <= finMin; t += DURACION_MIN) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const min = String(t % 60).padStart(2, "0");
    bloques.push(`${h}:${min}`);
  }
  return bloques;
}

/**
 * Devuelve las horas disponibles para agendar una cita con un odontólogo en una fecha dada,
 * respetando su jornada laboral de ese día y dejando al menos 30 minutos entre citas.
 *
 * idCitaExcluir: al editar una cita existente, se excluye a sí misma del choque de horarios.
 */
export async function obtenerHorasDisponibles(
  idOdontologo: string,
  fecha: string,
  idCitaExcluir?: string
): Promise<HorasDisponiblesResult> {
  if (!idOdontologo || !fecha) {
    return { atiende: false, horas: [], mensaje: "Selecciona fecha y odontólogo." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado" };
  }

  const dia = diaSemanaISO(fecha);

  const { data: asignacion } = await supabase
    .from("odontologos_jornadas")
    .select("id_jornada, jornadas ( hora_inicio, hora_fin )")
    .eq("id_odontologo", idOdontologo)
    .eq("dia_semana", dia)
    .maybeSingle();

  const jornada = asignacion?.jornadas as unknown as
    | { hora_inicio: string; hora_fin: string }
    | null
    | undefined;

  if (!asignacion || !jornada) {
    return {
      atiende: false,
      horas: [],
      mensaje: "El odontólogo no tiene jornada asignada ese día.",
    };
  }

  const bloques = generarBloques(jornada.hora_inicio, jornada.hora_fin);

  // Citas ya agendadas (pendientes o confirmadas) de ese odontólogo ese día
  const inicioDia = `${fecha}T00:00:00`;
  const finDia = `${fecha}T23:59:59`;

  let query = supabase
    .from("citas")
    .select("id_cita, fecha_cita")
    .eq("id_odontologo", idOdontologo)
    .in("estado", [1, 2])
    .gte("fecha_cita", inicioDia)
    .lte("fecha_cita", finDia);

  if (idCitaExcluir) {
    query = query.neq("id_cita", idCitaExcluir);
  }

  const { data: citasExistentes } = await query;

  // Construimos los timestamps de la misma forma en que se guardan al agendar
  // (new Date(`${fecha}T${hora}:00`)) para comparar de forma consistente.
  const ocupados = (citasExistentes ?? []).map((c) => new Date(c.fecha_cita).getTime());

  const ahora = Date.now();

  const disponibles = bloques.filter((hora) => {
    const timestamp = new Date(`${fecha}T${hora}:00`).getTime();
    if (timestamp <= ahora) return false; // no permitir horas ya pasadas
    return ocupados.every((o) => Math.abs(o - timestamp) >= DURACION_MIN * 60000);
  });

  return {
    atiende: true,
    horas: disponibles,
    mensaje:
      disponibles.length === 0
        ? "No hay horas disponibles para esa fecha; todas están ocupadas o ya pasaron."
        : "",
  };
}