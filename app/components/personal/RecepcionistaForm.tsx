"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearRecepcionista, type RecepcionistaState } from "@/app/actions/recepcionistas";
import Input from "@/Components/UI/Input";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateApellido,
  validateTelefono,
} from "@/utils/validations";

export default function RecepcionistaForm() {
  const [state, formAction, pending] = useActionState<RecepcionistaState, FormData>(
    crearRecepcionista,
    null
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [telefono, setTelefono] = useState("");

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
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
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
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
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
        togglePassword
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

      <button
        className="font-sans font-bold bg-clinica-dark text-white p-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors cursor-pointer"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creando recepcionista..." : "Crear Recepcionista"}
      </button>
    </form>
  );
}
