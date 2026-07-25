"use client";
import { useState } from "react";
import { actualizarStock } from "@/app/actions/catalogos";
import { Minus, Plus } from "lucide-react";

export default function StockEditor({ id, stockActual, unidad }: { id: string; stockActual: number; unidad: string }) {
    const [stock, setStock] = useState(stockActual);
    const [pending, setPending] = useState(false);

    async function cambiar(delta: number) {
    const nuevo = stock + delta;
    if (nuevo < 0) return;

    setPending(true);
    setStock(nuevo);
    const result = await actualizarStock(id, nuevo);
    setPending(false);

    if (result?.error) {
    setStock(stockActual);
    alert(result.error);
    }
    }

    return (
    <div className="flex items-center gap-2">
    <button onClick={() => cambiar(-1)} disabled={pending} className="p-1 border border-gray-300 rounded hover:bg-gray-50">
    <Minus size={14} />
    </button>
    <span className="font-sans font-semibold w-12 text-center">{stock}</span>
    <span className="text-xs text-gray-400">{unidad}</span>
    <button onClick={() => cambiar(1)} disabled={pending} className="p-1 border border-gray-300 rounded hover:bg-gray-50">
    <Plus size={14} />
    </button>
    </div>
    );
}