"use client";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    pending,
}: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    pending?: boolean;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={22} className="text-red-500" />
                </div>
                <button onClick={onCancel}><X size={20} className="text-gray-400" /></button>
            </div>

            <h2 className="text-lg font-sans font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-500 font-sans mb-6">{message}</p>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 border border-gray-300 rounded-lg py-2 font-sans font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    disabled={pending}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2 font-sans font-semibold hover:bg-red-500 disabled:opacity-50"
                >
                    {pending ? "Eliminando..." : "Eliminar"}
                </button>
            </div>
            </div>
        </div>
    );
}