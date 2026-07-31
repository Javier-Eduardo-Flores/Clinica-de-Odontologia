const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const lettersRegex = /^[A-Za-zÁ-ÿ\s]{3,50}$/;
const dniRegex = /^\d{13}$/;
const phoneRegex = /^\d{8}$/;
const passwordLetterRegex = /[a-zA-Z]/;
const passwordNumberRegex = /\d/;

export function validateEmail(value: string): string | null {
  if (!value) return 'El correo es obligatorio';
  if (!emailRegex.test(value))
    return 'Correo inválido (ej: nombre@dominio.com)';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'La contraseña es obligatoria';
  if (value.length < 6) return 'Mínimo 6 caracteres';
  if (!passwordLetterRegex.test(value))
    return 'Debe incluir al menos una letra';
  if (!passwordNumberRegex.test(value))
    return 'Debe incluir al menos un número';
  return null;
}

export function validateName(value: string, required: boolean): string | null {
  if (!value) {
    return required ? 'Este campo es obligatorio' : null;
  }
  if (!lettersRegex.test(value)) return 'Solo letras, mínimo 3 caracteres';
  return null;
}

export function validateApellido(
  value: string,
  required: boolean
): string | null {
  if (!value) {
    return required ? 'Este campo es obligatorio' : null;
  }
  if (!lettersRegex.test(value)) return 'Solo letras, mínimo 3 caracteres';
  return null;
}

export function validateDNI(value: string): string | null {
  if (!value) return 'El DNI es obligatorio';
  if (!dniRegex.test(value))
    return ' Solo numeros, 13 dígitos (ej: 0801199712301)';
  return null;
}

export function validateTelefono(value: string): string | null {
  if (!value) return 'El teléfono es obligatorio';
  if (!phoneRegex.test(value)) return 'Solo numeros, 8 dígitos (ej: 34456781)';
  return null;
}

export function validateFechaNacimiento(value: string): string | null {
  if (!value) return 'La fecha de nacimiento es obligatoria';
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) return 'La fecha no puede ser en el futuro';
  const age = today.getFullYear() - y;
  if (age > 120) return 'Ingrese una fecha válida';
  if (age < 1) return 'Usted ni dientes tiene';
  return null;
}

export function validateDireccion(value: string): string | null {
  if (!value) return 'La dirección es obligatoria';
  if (value.length < 5) return 'Mínimo 5 caracteres';
  return null;
}

export function validateGenero(value: string): string | null {
  if (!value) return 'Seleccione un género';
  return null;
}

export function validateSueldo(value: string): string | null {
  if (!value) return 'El sueldo es obligatorio';
  const num = Number(value);
  if (isNaN(num) || num <= 0) return 'Ingrese un sueldo válido mayor a 0';
  return null;
}
