"use client";
import { useState } from "react";
import { eliminarConsulta } from "@/app/actions/consultas";
import { Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/app/components/confirmdialog";

export default function ConsultaAcciones({
    idConsulta,
    esAdmin,
}: {
    idConsulta: string;
    esAdmin: boolean;
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pending, setPending] = useState(false);

    async function handleEliminar() {
        setPending(true);
        await eliminarConsulta(idConsulta);
        setPending(false);
        setConfirmOpen(false);
    }

    return (
        <div className="flex items-center gap-3 justify-end">
            {esAdmin && (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setConfirmOpen(true);
                }}
                className="text-gray-400 hover:text-red-600"
            >
                <Trash2 size={16} />
            </button>
            )}
            <Link href={`/dashboard/consultas/${idConsulta}`} className="text-gray-400 hover:text-clinica-dark">
            <ChevronRight size={18} />
            </Link>

            <ConfirmDialog
            open={confirmOpen}
            title="Eliminar consulta"
            message="¿Estás seguro de eliminar esta consulta? Se perderá el diagnóstico y los tratamientos registrados."
            onConfirm={handleEliminar}
            onCancel={() => setConfirmOpen(false)}
            pending={pending}
            />
        </div>
    );
}