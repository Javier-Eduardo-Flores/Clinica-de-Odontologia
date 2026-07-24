"use client";
import { useState } from "react";
import { toggleMetodoPago, toggleDescuento } from "@/app/actions/catalogos";

export default function ToggleSwitch({
    id,
    activo,
    tipo,
}: {
    id: string;
    activo: boolean;
    tipo: "metodo_pago" | "descuento";
}) {
    const [checked, setChecked] = useState(activo);
    const [pending, setPending] = useState(false);

    async function handleChange() {
        const nuevo = !checked;
        setChecked(nuevo);
        setPending(true);

        const result =
            tipo === "metodo_pago" ? await toggleMetodoPago(id, nuevo) : await toggleDescuento(id, nuevo);

        setPending(false);
        if (result?.error) setChecked(!nuevo);
    }

    return (
        <button
            onClick={handleChange}
            disabled={pending}
            className={`shrink-0 inline-flex items-center w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${
            checked ? "bg-clinica-dark" : "bg-gray-300"
            }`}
        >
            <span
            className={`absolute w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                checked ? "translate-x-5" : "translate-x-0.5"
            }`}
            />
        </button>
    );
}