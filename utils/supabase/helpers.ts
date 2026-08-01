import { cache } from "react";
import { createClient } from "./server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getUserRole = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  return perfil?.rol ?? null;
});

export const getUserProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, apellido, email, telefono, rol")
    .eq("id_profile", user.id)
    .maybeSingle();

  return perfil;
});
