"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarMiPerfil, type PacienteState, type Paciente } from "@/app/actions/pacientes";
import Input from "@/Components/UI/Input";
import Select from "@/Components/UI/Select";
import Textarea from "@/Components/UI/Textarea";
import {
  validateName,
  validateApellido,
  validateTelefono,
  validateFechaNacimiento,
  validateDireccion,
  validateGenero,
} from "@/utils/validations";

export default function EditarPerfilForm({ paciente, rol }: { paciente: Paciente; rol: string }) {
  const [state, formAction, pending] = useActionState<PacienteState, FormData>(
    actualizarMiPerfil,
    null
  );

  const [primerNombre, setPrimerNombre] = useState(paciente.primer_nombre);
  const [segundoNombre, setSegundoNombre] = useState(paciente.segundo_nombre ?? "");
  const [primerApellido, setPrimerApellido] = useState(paciente.primer_apellido);
  const [segundoApellido, setSegundoApellido] = useState(paciente.segundo_apellido ?? "");
  const [telefono, setTelefono] = useState(paciente.telefono);
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente.fecha_nacimiento.slice(0, 10));
  const [direccion, setDireccion] = useState(paciente.direccion ?? "");
  const [genero, setGenero] = useState(paciente.genero?.toString() ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const esPaciente = rol === "paciente";
  const esBasico = rol === "admin" || rol === "recepcionista";

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/dashboard/perfil");
    }
  }, [state, router]);

  const validate = (field: string, value: string) => {
    let error: string | null = null;
    switch (field) {
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
        {!esBasico && (
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
        )}
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
        {!esBasico && (
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
        )}
      </div>

      <div className="flex gap-3">
        {!esBasico && (
          <div className="flex-1">
            <label className="block text-sm font-inter font-semibold text-clinica-accent">DNI</label>
            <p className="w-full border border-gray-200 rounded-lg py-2 px-2 bg-gray-50 text-gray-500 text-sm">
              {paciente.dni}
            </p>
          </div>
        )}
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

      {!esBasico && (
        <>
          <Input
            type="date"
            label="Fecha de Nacimiento"
            name="fecha_nacimiento"
            placeholder=""
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
        </>
      )}

      <div className="flex gap-3">
        {esPaciente && (
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
        )}
        <div className="flex-1">
          <label className="block text-sm font-inter font-semibold text-clinica-accent">Correo</label>
          <p className="w-full border border-gray-200 rounded-lg py-2 px-2 bg-gray-50 text-gray-500 text-sm">
            {paciente.correo}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 rounded-lg py-2 font-sans font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          className="flex-1 bg-clinica-dark text-white font-sans font-semibold p-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors cursor-pointer"
          disabled={pending}
          type="submit"
        >
          {pending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
