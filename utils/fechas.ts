export function calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null;

  const [y, m, d] = fechaNacimiento.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - y;
  const mesActual = hoy.getMonth() + 1;

  if (mesActual < m || (mesActual === m && hoy.getDate() < d)) {
    edad--;
  }

  return edad;
}
