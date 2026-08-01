"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  editarRecepcionista,
  type RecepcionistaState,
  type Recepcionista,
} from "@/app/actions/recepcionistas";
import Input from "@/Components/UI/Input";
import {
  validateName,
  validateApellido,
  validateTelefono,
} from "@/utils/validations";

export default function EditarRecepcionistaForm({ recepcionista }: { recepcionista: Recepcionista }) {
  const [state, formAction, pending] = useActionState<RecepcionistaState, FormData>(
    editarRecepcionista,
    null
  );

  const [primerNombre, setPrimerNombre] = useState(recepcionista.nombre);
  const [primerApellido, setPrimerApellido] = useState(recepcionista.apellido);
  const [telefono, setTelefono] = useState(recepcionista.telefono);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/dashboard/personal");
    }
  }, [state, router]);

  const validate = (field: string, value: string) => {
    let error: string | null = null;
    switch (field) {
      case "primer_nombre":
        error = validateName(value, true);
        break;
      case "primer_apellido":
        error = validateApellido(value, true);
        break;
      case "telefono":
        error = validateTelefono(value);
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
      case "primer_apellido":
        setPrimerApellido(value);
        break;
      case "telefono":
        setTelefono(value);
        break;
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id_profile" value={recepcionista.id_profile} />

      {state && "error" in state && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-sm font-inter font-semibold text-clinica-accent" htmlFor="email">
          Correo Electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          readOnly
          value={recepcionista.email}
          className="w-full border border-gray-200 rounded-lg py-2 px-2 bg-gray-50 text-gray-500 cursor-default focus:outline-none"
        />
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
          onChange={(e) => handleChange("primer_nombre", e.target.value)}
          onBlur={(e) => validate("primer_nombre", e.target.value)}
        />
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
      </div>

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
