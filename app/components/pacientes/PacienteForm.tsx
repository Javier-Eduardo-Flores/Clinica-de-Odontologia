"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearPaciente, type PacienteState } from "@/app/actions/pacientes";
import Input from "@/Components/UI/Input";
import Select from "@/Components/UI/Select";
import Textarea from "@/Components/UI/Textarea";
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
} from "@/utils/validations";

export default function PacienteForm() {
  const [state, formAction, pending] = useActionState<PacienteState, FormData>(
    crearPaciente,
    null
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [genero, setGenero] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/dashboard/pacientes");
    }
  }, [state, router]);

  const validate = (field: string, value: string) => {
    let error: string | null = null;
    switch (field) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "primer_nombre":
        error = validateName(value, true);
        break;
      case "segundo_nombre":
        error = validateName(value, false);
        break;
      case "primer_apellido":
        error = validateApellido(value, true);
        break;
      case "segundo_apellido":
        error = validateApellido(value, false);
        break;
      case "dni":
        error = validateDNI(value);
        break;
      case "telefono":
        error = validateTelefono(value);
        break;
      case "fecha_nacimiento":
        error = validateFechaNacimiento(value);
        break;
      case "direccion":
        error = validateDireccion(value);
        break;
      case "genero":
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
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "primer_nombre":
        setPrimerNombre(value);
        break;
      case "segundo_nombre":
        setSegundoNombre(value);
        break;
      case "primer_apellido":
        setPrimerApellido(value);
        break;
      case "segundo_apellido":
        setSegundoApellido(value);
        break;
      case "dni":
        setDni(value);
        break;
      case "telefono":
        setTelefono(value);
        break;
      case "fecha_nacimiento":
        setFechaNacimiento(value);
        break;
      case "direccion":
        setDireccion(value);
        break;
      case "genero":
        setGenero(value);
        break;
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state && "error" in state && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
          {state.error}
        </p>
      )}

      <Input
        type="email"
        label="Correo Electrónico"
        name="email"
        placeholder="nombre@ejemplo.com"
        required={true}
        value={email}
        error={errors.email}
        onChange={(e) => handleChange("email", e.target.value)}
        onBlur={(e) => validate("email", e.target.value)}
      />

      <Input
        type="password"
        label="Contraseña"
        name="password"
        placeholder="••••••••"
        required={true}
        value={password}
        error={errors.password}
        onChange={(e) => handleChange("password", e.target.value)}
        onBlur={(e) => validate("password", e.target.value)}
      />

      <div className="flex gap-3">
        <Input
          type="text"
          label="Primer Nombre"
          name="primer_nombre"
          placeholder="Primer Nombre"
          required={true}
          value={primerNombre}
          error={errors.primer_nombre}
          onChange={(e) => handleChange("primer_nombre", e.target.value)}
          onBlur={(e) => validate("primer_nombre", e.target.value)}
        />
        <Input
          type="text"
          label="Segundo Nombre"
          name="segundo_nombre"
          placeholder="Segundo Nombre"
          required={false}
          value={segundoNombre}
          error={errors.segundo_nombre}
          onChange={(e) => handleChange("segundo_nombre", e.target.value)}
          onBlur={(e) => validate("segundo_nombre", e.target.value)}
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
          onChange={(e) => handleChange("primer_apellido", e.target.value)}
          onBlur={(e) => validate("primer_apellido", e.target.value)}
        />
        <Input
          type="text"
          label="Segundo Apellido"
          name="segundo_apellido"
          placeholder="Segundo Apellido"
          required={false}
          value={segundoApellido}
          error={errors.segundo_apellido}
          onChange={(e) => handleChange("segundo_apellido", e.target.value)}
          onBlur={(e) => validate("segundo_apellido", e.target.value)}
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
          onChange={(e) => handleChange("dni", e.target.value)}
          onBlur={(e) => validate("dni", e.target.value)}
        />
        <Input
          type="text"
          label="Teléfono"
          name="telefono"
          placeholder="34456781"
          required={true}
          value={telefono}
          error={errors.telefono}
          onChange={(e) => handleChange("telefono", e.target.value)}
          onBlur={(e) => validate("telefono", e.target.value)}
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
        onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
        onBlur={(e) => validate("fecha_nacimiento", e.target.value)}
      />

      <Textarea
        label="Dirección"
        name="direccion"
        placeholder="Col. Kennedy"
        required={true}
        value={direccion}
        error={errors.direccion}
        onChange={(e) => handleChange("direccion", e.target.value)}
        onBlur={(e) => validate("direccion", e.target.value)}
      />

      <Select
        label="Género"
        name="genero"
        required={true}
        placeholder="Seleccionar género"
        options={[
          { value: "1", label: "Masculino" },
          { value: "2", label: "Femenino" },
        ]}
        value={genero}
        error={errors.genero}
        onChange={(e) => {
          handleChange("genero", e.target.value);
          validate("genero", e.target.value);
        }}
      />

      <button
        className="font-sans font-bold bg-clinica-dark text-white p-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors cursor-pointer"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creando paciente..." : "Crear Paciente"}
      </button>
    </form>
  );
}
