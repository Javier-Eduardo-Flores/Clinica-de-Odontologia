// app/components/inventario/BotonEliminar.tsx
"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { eliminarProducto } from "@/app/actions/inventario";

export default function BotonEliminar({ idProducto, nombre }: { idProducto: string, nombre: string }) {
  const [isPending, startTransition] = useTransition();

  const handleEliminar = () => {
    // Un pequeño aviso para que no borren por accidente xd
    if (window.confirm(`¿Seguro que quieres eliminar "${nombre}" del inventario?`)) {
      startTransition(async () => {
        await eliminarProducto(idProducto);
      });
    }
  };

  return (
    <button
      onClick={handleEliminar}
      disabled={isPending}
      className="ml-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
      title="Eliminar producto"
    >
      <Trash2 size={18} />
    </button>
  ); 
} 