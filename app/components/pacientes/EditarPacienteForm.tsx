"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { editarPaciente, type PacienteState, type Paciente } from "@/app/actions/pacientes";
import Input from "@/Components/UI/Input";
import Select from "@/Components/UI/Select";
import Textarea from "@/Components/UI/Textarea";
import {
  validateName,
  validateApellido,
  validateDNI,
  validateTelefono,
  validateFechaNacimiento,
  validateDireccion,
  validateGenero,
} from "@/utils/validations";

export default function EditarPacienteForm({ paciente }: { paciente: Paciente }) {
  const [state, formAction, pending] = useActionState<PacienteState, FormData>(
    editarPaciente,
    null
  );

  const [primerNombre, setPrimerNombre] = useState(paciente.primer_nombre);
  const [segundoNombre, setSegundoNombre] = useState(paciente.segundo_nombre ?? "");
  const [primerApellido, setPrimerApellido] = useState(paciente.primer_apellido);
  const [segundoApellido, setSegundoApellido] = useState(paciente.segundo_apellido ?? "");
  const [dni, setDni] = useState(paciente.dni);
  const [telefono, setTelefono] = useState(paciente.telefono);
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente.fecha_nacimiento.slice(0, 10));
  const [direccion, setDireccion] = useState(paciente.direccion ?? "");
  const [genero, setGenero] = useState(paciente.genero?.toString() ?? "");
  const [estado, setEstado] = useState(paciente.estado.toString());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/dashboard/pacientes/" + paciente.id_paciente);
    }
  }, [state, router, paciente.id_paciente]);

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
      case "estado":
        setEstado(value);
        break;
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id_paciente" value={paciente.id_paciente} />

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

      <div className="flex gap-3">
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
        <Select
          label="Estado"
          name="estado"
          required={true}
          options={[
            { value: "1", label: "Activo" },
            { value: "0", label: "Inactivo" },
          ]}
          value={estado}
          onChange={(e) => handleChange("estado", e.target.value)}
        />
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
