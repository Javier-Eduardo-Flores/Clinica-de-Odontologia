"use client";

import { useActionState } from "react";
import { signUp } from "../actions/auth";
import Link from "next/link";

export default function RegisterPage() {
    const [state, formAction, pending] = useActionState(signUp, null);

    return (
        <form action={formAction} className="flex flex-col gap-3 max-w-lg mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold text-center">Registro Paciente</h1>

            {state?.error && (
                <p className="text-red-500 text-sm text-center">{state.error}</p>
            )}

            <input className="border p-2 rounded" name="email" type="email" placeholder="Email *" required />
            <input className="border p-2 rounded" name="password" type="password" placeholder="Contraseña *" required />

            <div className="flex gap-2">
                <input className="border p-2 rounded flex-1" name="primer_nombre" placeholder="Primer nombre *" required />
                <input className="border p-2 rounded flex-1" name="segundo_nombre" placeholder="Segundo nombre" />
            </div>

            <div className="flex gap-2">
                <input className="border p-2 rounded flex-1" name="primer_apellido" placeholder="Primer apellido *" required />
                <input className="border p-2 rounded flex-1" name="segundo_apellido" placeholder="Segundo apellido" />
            </div>

            <input className="border p-2 rounded" name="dni" placeholder="DNI *" required />
            <input className="border p-2 rounded" name="telefono" type="tel" placeholder="Teléfono *" required />
            <input className="border p-2 rounded" name="fecha_nacimiento" type="date" required />

            <input className="border p-2 rounded" name="direccion" placeholder="Dirección" />

            <select className="border p-2 rounded" name="genero">
                <option value="">Seleccionar género</option>
                <option value="1">Masculino</option>
                <option value="2">Femenino</option>
                <option value="3">Otro</option>
            </select>

            <button className="bg-blue-600 text-white p-2 rounded disabled:opacity-50" disabled={pending} type="submit">
                {pending ? "Registrando..." : "Registrarse"}
            </button>

            <p className="text-sm text-center">
                ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 underline">Inicia sesión</Link>
            </p>
        </form>
    );
}
