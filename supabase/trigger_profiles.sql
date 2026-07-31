CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN 
  INSERT INTO public.profiles (id_profile,email,nombre,apellido,rol,telefono)
  VALUES(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'primer_nombre', 'Sin nombre'),
    COALESCE(NEW.raw_user_meta_data ->> 'primer_apellido', 'Sin apellido'),
    COALESCE(NEW.raw_user_meta_data ->> 'rol', 'paciente'),
    COALESCE(NEW.raw_user_meta_data ->> 'telefono', '')
  );

  IF NEW.raw_user_meta_data ->> 'rol' = 'paciente' then
    INSERT INTO public.pacientes (
      id_paciente, dni, primer_nombre,segundo_nombre,
      primer_apellido,segundo_apellido,telefono,estado,correo,
      fecha_nacimiento,direccion,genero
    )VALUES(
      NEW.id,
      NEW.raw_user_meta_data ->>'dni',
      NEW.raw_user_meta_data ->>'primer_nombre',
      NULLIF(NEW.raw_user_meta_data ->>'segundo_nombre', ''),
      NEW.raw_user_meta_data ->>'primer_apellido',
      NULLIF(NEW.raw_user_meta_data ->>'segundo_apellido', ''),
      NEW.raw_user_meta_data ->>'telefono',
      1,
      NEW.email,
      (NEW.raw_user_meta_data ->>'fecha_nacimiento')::date,
      NULLIF(NEW.raw_user_meta_data ->>'direccion', ''),
      NULLIF((NEW.raw_user_meta_data ->>'genero'), '')::smallint
    );

  ELSIF NEW.raw_user_meta_data ->> 'rol' = 'doctor' then
    INSERT INTO public.odontologos (
      id_odontologo,primer_nombre,segundo_nombre,primer_apellido,segundo_apellido,
      correo, telefono, direccion, fecha_nacimiento, estado, sueldo, dni
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->>'primer_nombre',
      NULLIF(NEW.raw_user_meta_data ->>'segundo_nombre', ''),
      NEW.raw_user_meta_data ->>'primer_apellido',
      NULLIF(NEW.raw_user_meta_data ->>'segundo_apellido', ''),
      NEW.email,
      NEW.raw_user_meta_data ->>'telefono',
      NULLIF(NEW.raw_user_meta_data ->>'direccion', ''),
      (NEW.raw_user_meta_data ->>'fecha_nacimiento')::date,
      1,
      (NEW.raw_user_meta_data ->>'sueldo')::numeric,
      NEW.raw_user_meta_data ->>'dni'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
