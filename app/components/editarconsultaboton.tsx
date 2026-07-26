"use client";
import { useState, useRef  } from "react";
import { editarConsulta } from "@/app/actions/consultas";
import { ClipboardPen, Plus, X, Trash2 } from "lucide-react";

type DetalleExistente = {
    detalle_consulta_id: string;
    id_tratamiento: string;
    cantidad: number;
    observaciones: string | null;
};

type Tratamiento = {
    id_tratamiento: string;
    nombre: string;
    precio: number;
};

type LineaTemporal = {
    key: number;
    id_tratamiento: string;
    cantidad: number;
    observaciones: string;
};

export default function EditarConsultaButton({
    idConsulta,
    diagnostico,
    observaciones,
    detallesExistentes,
    tratamientos,
    puedeEditar,
    motivoBloqueo,
}: {
    idConsulta: string;
    diagnostico: string;
    observaciones: string | null;
    detallesExistentes: DetalleExistente[];
    tratamientos: Tratamiento[];
    puedeEditar: boolean;
    motivoBloqueo?: string;
}) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const [diag, setDiag] = useState(diagnostico);
    const [obs, setObs] = useState(observaciones ?? "");

    const contadorRef = useRef(0);
    function generarKey() {
        contadorRef.current += 1;
        return contadorRef.current;
    }

    const [lineas, setLineas] = useState<LineaTemporal[]>(
        detallesExistentes.map((d, index) => ({
            key: index,
            id_tratamiento: d.id_tratamiento,
            cantidad: d.cantidad,
            observaciones: d.observaciones ?? "",
        }))
    );

    function agregarLinea() {
        setLineas((prev) => [...prev,
        { key: 1000 + generarKey(), id_tratamiento: "", cantidad: 1, observaciones: "" },
    ]);
}
    function quitarLinea(key: number) {
        setLineas((prev) => prev.filter((l) => l.key !== key));
    }

    function actualizarLinea(key: number, campo: keyof LineaTemporal, valor: string | number) {
        setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l)));
    }

    async function handleSubmit() {
        setError(null);
        if (!diag.trim()) return setError("El diagnóstico es obligatorio");
        if (lineas.length === 0) return setError("Debe quedar al menos un tratamiento");
        if (lineas.some((l) => !l.id_tratamiento)) return setError("Completa el tratamiento en todas las filas");

        setPending(true);
        const result = await editarConsulta(idConsulta, {
            diagnostico: diag,
            observaciones: obs,
            tratamientos: lineas.map(({ id_tratamiento, cantidad, observaciones }) => ({
            id_tratamiento,
            cantidad,
            observaciones,
            })),
        });
        setPending(false);

        if (result?.error) setError(result.error);
        else setOpen(false);
    }

    if (!puedeEditar) {
        return (
            <span title={motivoBloqueo ?? "No tienes permiso para editar esta consulta"}>
            <ClipboardPen size={18} className="text-gray-300 cursor-not-allowed" />
            </span>
        );
    }

    return (
        <>
            <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm font-sans text-gray-500 hover:text-clinica-dark"
            title="Editar diagnóstico, observaciones y tratamientos"
            >
            <ClipboardPen size={16} />
            </button>

            {open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3 bg-white">
                        <ClipboardPen size={24} className="text-clinica-dark" />
                        <h2 className="text-lg font-sans font-bold text-gray-900">Editar Consulta</h2>
                        </div>
                        <button onClick={() => setOpen(false)}><X size={20} className="text-gray-400" /></button>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-sans font-semibold text-gray-700">Diagnóstico</label>
                            <textarea
                                value={diag}
                                onChange={(e) => setDiag(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 font-sans mt-1 min-h-20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-sans font-semibold text-gray-700">Observaciones</label>
                            <textarea
                                value={obs}
                                onChange={(e) => setObs(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 font-sans mt-1 min-h-16"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-sans font-semibold text-gray-700">Tratamientos Realizados</label>
                                <button
                                    type="button"
                                    onClick={agregarLinea}
                                    className="flex items-center gap-1 text-sm font-sans font-semibold text-clinica-dark hover:underline"
                                >
                                    <Plus size={16} /> Agregar
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {lineas.map((linea) => (
                                    <div key={linea.key} className="flex gap-2 items-start border border-gray-200 rounded-lg p-3">
                                        <select
                                        value={linea.id_tratamiento}
                                        onChange={(e) => actualizarLinea(linea.key, "id_tratamiento", e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                                        >
                                        <option value="">Seleccionar tratamiento</option>
                                        {tratamientos.map((t) => (
                                            <option key={t.id_tratamiento} value={t.id_tratamiento}>
                                                {t.nombre} — ${t.precio}
                                            </option>
                                        ))}
                                        </select>
                                        <input
                                        type="number"
                                        min="1"
                                        value={linea.cantidad}
                                        onChange={(e) => actualizarLinea(linea.key, "cantidad", Number(e.target.value))}
                                        className="w-16 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                                        />
                                        <input
                                        type="text"
                                        placeholder="Notas"
                                        value={linea.observaciones}
                                        onChange={(e) => actualizarLinea(linea.key, "observaciones", e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                                        />
                                        <button type="button" onClick={() => quitarLinea(linea.key)} className="text-gray-400 hover:text-red-600 mt-2 shrink-0">
                                        <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={pending}
                            className="bg-clinica-dark text-white font-sans font-semibold py-2.5 rounded-lg disabled:opacity-50"
                        >
                            {pending ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
            )}
        </>
    );
}