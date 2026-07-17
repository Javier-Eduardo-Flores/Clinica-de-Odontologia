'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, type AuthState } from '../actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../Components/UI/Input';
import Textarea from '../../Components/UI/Textarea';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateApellido,
  validateDNI,
  validateTelefono,
  validateFechaNacimiento,
  validateDireccion,
  validateGenero,
} from '../../utils/validations';

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUp,
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [genero, setGenero] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      router.push('/login');
    }
  }, [state, router]);

  const validate = (field: string, value: string) => {
    let error: string | null = null;
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'primer_nombre':
        error = validateName(value, true);
        break;
      case 'segundo_nombre':
        error = validateName(value, false);
        break;
      case 'primer_apellido':
        error = validateApellido(value, true);
        break;
      case 'segundo_apellido':
        error = validateApellido(value, false);
        break;
      case 'dni':
        error = validateDNI(value);
        break;
      case 'telefono':
        error = validateTelefono(value);
        break;
      case 'fecha_nacimiento':
        error = validateFechaNacimiento(value);
        break;
      case 'direccion':
        error = validateDireccion(value);
        break;
      case 'genero':
        error = validateGenero(value);
        break;
    }
    setErrors((prev) => {
      if (error) return { ...prev, [field]: error };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'primer_nombre':
        setPrimerNombre(value);
        break;
      case 'segundo_nombre':
        setSegundoNombre(value);
        break;
      case 'primer_apellido':
        setPrimerApellido(value);
        break;
      case 'segundo_apellido':
        setSegundoApellido(value);
        break;
      case 'dni':
        setDni(value);
        break;
      case 'telefono':
        setTelefono(value);
        break;
      case 'fecha_nacimiento':
        setFechaNacimiento(value);
        break;
      case 'direccion':
        setDireccion(value);
        break;
      case 'genero':
        setGenero(value);
        break;
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-clinica-light to-blue-50 flex items-center justify-center font-inter">
      <div className="flex flex-col items-center justify-center h-[80%] bg-clinica-light rounded-2xl shadow-2xl px-8 py-4 max-w-137">
        <div>
          <Image
            src="/diente-icon.png"
            alt="Icono de diente"
            width={60}
            height={60}
          />
        </div>
        <h1 className="text-2xl font-bold  text-clinica-dark text-center">
          Registro de Nuevo Paciente
        </h1>
        <p className="text-center text-clinica-accent font-sans mt-1 mb-4">
          Por favor completa la información a continuación para crear su
          historial clínico y proseguir con su agenda.
        </p>
        <form
          action={formAction}
          className="flex flex-col gap-3 max-w-lg mx-auto p-4"
        >
          {state && 'error' in state && (
            <p className="text-red-500 text-sm text-center">{state.error}</p>
          )}

          <div>
            <label
              className="block text-sm font-inter font-semibold text-clinica-accent"
              htmlFor="email"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                name="email"
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={(e) => validate('email', e.target.value)}
                className={`w-full border rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-clinica-dark'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-inter font-semibold text-clinica-accent"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={(e) => validate('password', e.target.value)}
                className={`w-full border rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-clinica-dark'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Input
              type="text"
              label="Primer Nombre"
              name="primer_nombre"
              placeholder="Primer Nombre"
              required={true}
              value={primerNombre}
              error={errors.primer_nombre}
              onChange={(e) => handleChange('primer_nombre', e.target.value)}
              onBlur={(e) => validate('primer_nombre', e.target.value)}
            />
            <Input
              type="text"
              label="Segundo Nombre"
              name="segundo_nombre"
              placeholder="Segundo Nombre"
              required={false}
              value={segundoNombre}
              error={errors.segundo_nombre}
              onChange={(e) => handleChange('segundo_nombre', e.target.value)}
              onBlur={(e) => validate('segundo_nombre', e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Input
              type="text"
              label="Primer Apellido"
              name="primer_apellido"
              placeholder="Primer Apellido"
              required={true}
              value={primerApellido}
              error={errors.primer_apellido}
              onChange={(e) => handleChange('primer_apellido', e.target.value)}
              onBlur={(e) => validate('primer_apellido', e.target.value)}
            />
            <Input
              type="text"
              label="Segundo Apellido"
              name="segundo_apellido"
              placeholder="Segundo Apellido"
              required={false}
              value={segundoApellido}
              error={errors.segundo_apellido}
              onChange={(e) => handleChange('segundo_apellido', e.target.value)}
              onBlur={(e) => validate('segundo_apellido', e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Input
              type="text"
              label="DNI"
              name="dni"
              placeholder="0801199712301"
              required={true}
              value={dni}
              error={errors.dni}
              onChange={(e) => handleChange('dni', e.target.value)}
              onBlur={(e) => validate('dni', e.target.value)}
            />
            <Input
              type="text"
              label="Teléfono"
              name="telefono"
              placeholder="34456781"
              required={true}
              value={telefono}
              error={errors.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              onBlur={(e) => validate('telefono', e.target.value)}
            />
          </div>

          <Input
            type="date"
            label="Fecha de Nacimiento"
            name="fecha_nacimiento"
            placeholder="12/03/1990"
            required={true}
            value={fechaNacimiento}
            error={errors.fecha_nacimiento}
            onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
            onBlur={(e) => validate('fecha_nacimiento', e.target.value)}
          />

          <Textarea
            label="Dirección"
            name="direccion"
            placeholder="Col. Kennedy"
            required={true}
            value={direccion}
            error={errors.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            onBlur={(e) => validate('direccion', e.target.value)}
          />

          <div>
            <label
              className="block text-sm font-inter font-semibold text-clinica-accent"
              htmlFor="genero"
            >
              Género
            </label>
            <select
              className={`w-full border rounded-lg py-2 px-2 focus:outline-none focus:ring-2 ${
                errors.genero
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-clinica-dark'
              }`}
              name="genero"
              required
              value={genero}
              onChange={(e) => {
                handleChange('genero', e.target.value);
                validate('genero', e.target.value);
              }}
            >
              <option value="">Seleccionar género</option>
              <option value="1">Masculino</option>
              <option value="2">Femenino</option>
            </select>
            {errors.genero && (
              <p className="text-red-500 text-xs mt-1">{errors.genero}</p>
            )}
          </div>

          <button
            className="font-inter font-bold bg-clinica-dark cursor-pointer text-clinica-light p-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors"
            disabled={pending}
            type="submit"
          >
            {pending ? 'Registrando...' : 'Registrarse'}
          </button>

          <p className="text-sm text-center">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-inter font-semibold text-clinica-accent opacity-70 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
