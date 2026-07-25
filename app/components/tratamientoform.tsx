"use client";
import { useState } from "react";
import { crearTratamiento, editarTratamiento, eliminarTratamiento } from "@/app/actions/catalogos";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/app/components/confirmdialog";

type Tratamiento = {
    id_tratamiento: string;
    nombre: string;
    descripcion: string;
    precio: number;
};

export default function TratamientoForm({
    mode,
    tratamiento,
}: {
    mode: "crear" | "editar";
    tratamiento?: Tratamiento;
}) {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false); // controla el modal de eliminar
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleSubmit(formData: FormData) {
            setPending(true);
            setError(null);

        const result =
            mode === "crear"
            ? await crearTratamiento(formData)
            : await editarTratamiento(tratamiento!.id_tratamiento, formData);

        setPending(false);
        if (result?.error) {
            setError(result.error);
        } else {
            setOpen(false);
        }
    }

    async function handleEliminar() {
        setDeleting(true);
        await eliminarTratamiento(tratamiento!.id_tratamiento);
        setDeleting(false);
        setConfirmOpen(false);
    }

    return (
        <>
            {mode === "crear" ? (
            <button
                onClick={() => setOpen(true)}
                className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-clinica-medium"
            >
                <Plus size={18} /> Nuevo Tratamiento
            </button>
            ) : (
            <div className="flex items-center gap-3">
                <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-clinica-dark">
                    <Pencil size={16} />
                </button>
                <button onClick={() => setConfirmOpen(true)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                </button>
            </div>
            )}

            {open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-sans font-bold text-gray-900">
                        {mode === "crear" ? "Nuevo Tratamiento" : "Editar Tratamiento"}
                        </h2>
                        <button onClick={() => setOpen(false)}><X size={20} className="text-gray-400" /></button>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <form action={handleSubmit} className="flex flex-col gap-3">
                        <input
                        name="nombre"
                        defaultValue={tratamiento?.nombre}
                        placeholder="Nombre del tratamiento"
                        required
                        className="border border-gray-300 rounded-lg p-2 font-sans"
                        />
                        <textarea
                        name="descripcion"
                        defaultValue={tratamiento?.descripcion}
                        placeholder="Descripción"
                        className="border border-gray-300 rounded-lg p-2 font-sans"
                        />
                        <input
                        name="precio"
                        type="number"
                        step="0.01"
                        min="0.01"
                        defaultValue={tratamiento?.precio}
                        placeholder="Precio"
                        required
                        className="border border-gray-300 rounded-lg p-2 font-sans"
                        />
                        <button
                        type="submit"
                        disabled={pending}
                        className="bg-clinica-dark text-white font-sans font-semibold py-2 rounded-lg disabled:opacity-50"
                        >
                        {pending ? "Guardando..." : "Guardar"}
                        </button>
                    </form>
                </div>
            </div>
            )}
            
            <ConfirmDialog
            open={confirmOpen}
            title="Eliminar tratamiento"
            message={`¿Estás seguro de eliminar "${tratamiento?.nombre}"? Esta acción no se puede deshacer.`}
            onConfirm={handleEliminar}
            onCancel={() => setConfirmOpen(false)}
            pending={deleting}
            />
        </>
    );
}