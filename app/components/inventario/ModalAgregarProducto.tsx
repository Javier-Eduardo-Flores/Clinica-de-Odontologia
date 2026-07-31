// app/components/inventario/ModalAgregarProducto.tsx
"use client";

import { useState, useActionState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { agregarProducto } from "@/app/actions/inventario";

export default function ModalAgregarProducto() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(agregarProducto, null);

  // Cerrar el modal automáticamente si se guardó con éxito
  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-clinica-dark text-white px-4 py-2 rounded-lg font-sans font-semibold hover:bg-clinica-medium transition-colors"
      >
        <Plus size={18} />
        Nuevo Producto
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold font-sans text-gray-900">Agregar Producto</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form action={formAction} className="p-5 flex flex-col gap-4">
              {state?.error && (
                <p className="text-red-500 text-sm font-sans">{state.error}</p>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input name="nombre" type="text" required className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-clinica-dark outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea name="descripcion" rows={2} required className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-clinica-dark outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (L.)</label>
                  <input name="precio" type="number" step="0.01" required min="0" className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-clinica-dark outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
                  <input name="stock" type="number" required min="0" className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-clinica-dark outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unidad de Medida</label>
                <select name="unidad_medida" required className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-clinica-dark outline-none bg-white">
                  <option value="unidades">Unidades</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="cajas">Cajas</option>
                </select>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={pending} className="px-4 py-2 bg-clinica-dark text-white font-semibold rounded-lg hover:bg-clinica-medium disabled:opacity-50">
                  {pending ? "Guardando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}  