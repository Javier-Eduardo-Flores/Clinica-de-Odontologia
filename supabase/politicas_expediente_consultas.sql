-- ============================================================
-- Integrante 4: Expediente Clínico y Consultas
-- Tablas: expediente, consultas, detalle_consultas
--
-- 1) Políticas RLS: lectura estricta para pacientes (solo lo suyo),
--    lectura/escritura total para médicos y administradores.
--    Recepcionista NO tiene acceso (no gestiona historial clínico,
--    ver guia_arquitectura_equipo_v2, sección 1).
-- 2) RPC transaccional registrar_consulta_completa: inserta la
--    cabecera en `consultas` y el arreglo de N filas en
--    `detalle_consultas` en una sola operación atómica.
-- ============================================================

-- ---------- 1. ROW LEVEL SECURITY ----------

alter table public.expediente enable row level security;
alter table public.consultas enable row level security;
alter table public.detalle_consultas enable row level security;

-- ===== EXPEDIENTE =====

drop policy if exists "Admin y doctor gestionan expedientes" on public.expediente;
create policy "Admin y doctor gestionan expedientes"
on public.expediente
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id_profile = auth.uid()
      and profiles.rol in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id_profile = auth.uid()
      and profiles.rol in ('admin', 'doctor')
  )
);

drop policy if exists "Paciente lee su propio expediente" on public.expediente;
create policy "Paciente lee su propio expediente"
on public.expediente
for select
using (id_paciente = auth.uid());

-- ===== CONSULTAS =====

drop policy if exists "Admin y doctor gestionan consultas" on public.consultas;
create policy "Admin y doctor gestionan consultas"
on public.consultas
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id_profile = auth.uid()
      and profiles.rol in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id_profile = auth.uid()
      and profiles.rol in ('admin', 'doctor')
  )
);

drop policy if exists "Paciente lee sus propias consultas" on public.consultas;
create policy "Paciente lee sus propias consultas"
on public.consultas
for select
using (
  exists (
    select 1 from public.citas
    where citas.id_cita = consultas.id_cita
      and citas.id_usuario = auth.uid()
  )
);

-- ===== DETALLE_CONSULTAS =====

drop policy if exists "Admin y doctor gestionan detalle_consultas" on public.detalle_consultas;
create policy "Admin y doctor gestionan detalle_consultas"
on public.detalle_consultas
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id_profile = auth.uid()
      and profiles.rol in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id_profile = auth.uid()
      and profiles.rol in ('admin', 'doctor')
  )
);

drop policy if exists "Paciente lee el detalle de sus propias consultas" on public.detalle_consultas;
create policy "Paciente lee el detalle de sus propias consultas"
on public.detalle_consultas
for select
using (
  exists (
    select 1
    from public.consultas
    join public.citas on citas.id_cita = consultas.id_cita
    where consultas.id_consulta = detalle_consultas.id_consulta
      and citas.id_usuario = auth.uid()
  )
);

-- ---------- 2. OPERACIÓN TRANSACCIONAL (RPC) ----------
-- Usada por app/actions/consultas.ts -> registrarConsultaRPC().
-- security invoker: corre con los permisos del usuario que llama,
-- así las políticas RLS de arriba se siguen aplicando (solo
-- admin/doctor pueden ejecutar el insert con éxito).

create or replace function public.registrar_consulta_completa(
  p_id_cita uuid,
  p_id_odontologo uuid,
  p_fecha date,
  p_diagnostico text,
  p_observaciones text,
  p_tratamientos jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id_consulta uuid;
  v_linea jsonb;
begin
  if p_diagnostico is null or btrim(p_diagnostico) = '' then
    raise exception 'El diagnóstico es obligatorio';
  end if;

  if p_id_cita is null then
    raise exception 'Debe indicar la cita asociada';
  end if;

  if p_tratamientos is null or jsonb_array_length(p_tratamientos) = 0 then
    raise exception 'Debe registrar al menos un tratamiento';
  end if;

  insert into public.consultas (id_cita, id_odontologo, fecha, diagnostico, observaciones)
  values (
    p_id_cita,
    p_id_odontologo,
    coalesce(p_fecha, current_date),
    btrim(p_diagnostico),
    nullif(btrim(coalesce(p_observaciones, '')), '')
  )
  returning id_consulta into v_id_consulta;

  for v_linea in select * from jsonb_array_elements(p_tratamientos)
  loop
    if v_linea->>'id_tratamiento' is null or btrim(v_linea->>'id_tratamiento') = '' then
      raise exception 'Cada tratamiento debe tener un id_tratamiento válido';
    end if;

    insert into public.detalle_consultas (id_consulta, id_tratamiento, cantidad, observaciones)
    values (
      v_id_consulta,
      (v_linea->>'id_tratamiento')::uuid,
      greatest(coalesce((v_linea->>'cantidad')::int, 1), 1),
      nullif(btrim(coalesce(v_linea->>'observaciones', '')), '')
    );
  end loop;

  return v_id_consulta;
end;
$$;

grant execute on function public.registrar_consulta_completa(uuid, uuid, date, text, text, jsonb) to authenticated;
