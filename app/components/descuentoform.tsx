"use client";
import { useState } from "react";
import { crearDescuento } from "@/app/actions/catalogos";
import { Plus, X } from "lucide-react";

export default function DescuentoForm() {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setPending(true);
        setError(null);
        const result = await crearDescuento(formData);
        setPending(false);

        if (result?.error) setError(result.error);
        else setOpen(false);
    }

    return (
        <>
            <button
            onClick={() => setOpen(true)}
            className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-clinica-medium"
            >
            <Plus size={18} /> Nuevo Descuento
            </button>

            {open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-sans font-bold text-gray-900">Nuevo Descuento</h2>
                        <button onClick={() => setOpen(false)}><X size={20} className="text-gray-400" /></button>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <form action={handleSubmit} className="flex flex-col gap-3">
                        <input name="nombre" placeholder="Nombre de la promoción" required className="border border-gray-300 rounded-lg p-2 font-sans" />

                        <select name="tipo" required className="border border-gray-300 rounded-lg p-2 font-sans">
                        <option value="porcentaje">Porcentaje (%)</option>
                        <option value="monto">Monto fijo ($)</option>
                        </select>

                        <input name="valor" type="number" step="0.01" min="0.01" placeholder="Valor" required className="border border-gray-300 rounded-lg p-2 font-sans" />

                        <label className="text-xs font-sans text-gray-500">Fecha inicio</label>
                        <input name="fecha_inicio" type="date" required className="border border-gray-300 rounded-lg p-2 font-sans" />

                        <label className="text-xs font-sans text-gray-500">Fecha fin</label>
                        <input name="fecha_fin" type="date" required className="border border-gray-300 rounded-lg p-2 font-sans" />

                        <button type="submit" disabled={pending} className="bg-clinica-dark text-white font-sans font-semibold py-2 rounded-lg disabled:opacity-50">
                        {pending ? "Guardando..." : "Guardar"}
                        </button>
                    </form>
                </div>
            </div>
            )}
        </>
    );
}