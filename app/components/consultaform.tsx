"use client";
import { useState } from "react";
import { registrarConsultaRPC } from "@/app/actions/consultas";
import { Plus, Trash2, Calendar, FileText, CalendarClock, UserRoundSearch  } from "lucide-react";
import { useRouter } from "next/navigation";

type Cita = {
    id_cita: string;
    fecha_cita: string;
    motivo: string;
    profiles: { nombre: string; apellido: string } | null;
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

export default function ConsultaForm({
    citas,
    tratamientos,
    idOdontologo,
}: {
    citas: Cita[];
    tratamientos: Tratamiento[];
    idOdontologo: string;
}) {
    const router = useRouter();

    const [idCita, setIdCita] = useState("");
    const citaSeleccionada = citas.find((c) => c.id_cita === idCita);
    const fecha = citaSeleccionada ? citaSeleccionada.fecha_cita.slice(0, 10) : "";
    const [diagnostico, setDiagnostico] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [lineas, setLineas] = useState<LineaTemporal[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    function agregarLinea() {
        setLineas((prev) => [
            ...prev,
            { key: Date.now(), id_tratamiento: "", cantidad: 1, observaciones: "" },
        ]);
    }

    function quitarLinea(key: number) {
        setLineas((prev) => prev.filter((l) => l.key !== key));
    }

    function actualizarLinea(key: number, campo: keyof LineaTemporal, valor: string | number) {
        setLineas((prev) =>
            prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l))
        );
    }

    async function handleSubmit() {
        setError(null);

        if (!idCita) return setError("Selecciona una cita");
        if (lineas.some((l) => !l.id_tratamiento)) return setError("Completa el tratamiento en todas las filas");

        setPending(true);
        const result = await registrarConsultaRPC({
            id_cita: idCita,
            id_odontologo: idOdontologo,
            fecha,
            diagnostico,
            observaciones,
            tratamientos: lineas.map(({ id_tratamiento, cantidad, observaciones }) => ({
            id_tratamiento,
            cantidad,
            observaciones,
            })),
        });
        setPending(false);

        if (result?.error) {
            setError(result.error);
        } else {
            router.push("/dashboard/consultas");
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-5xl">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="text-sm font-sans font-semibold text-gray-700">Cita asociada</label>
                <div className="relative">
                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                    value={idCita}
                    onChange={(e) => setIdCita(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                >
                    <option value="">Seleccione una cita</option>
                    {citas.map((c) => (
                        <option key={c.id_cita} value={c.id_cita}>
                                {c.profiles?.nombre} {c.profiles?.apellido} — {new Date(c.fecha_cita).toLocaleDateString("es")} ({c.motivo})
                        </option>
                    ))}
                </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-sans font-semibold text-gray-700 mb-1">Fecha de la consulta</label>
                <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <div>
                    <div className="w-full border border-gray-200 bg-gray-50 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-clinica-dark font-sans text-gray-600">
                        {fecha
                        ? new Date(fecha).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })
                        : "Selecciona una cita primero"}
                    </div>
                </div>
                </div>
            </div>
            </div>

            <div className="mb-4">
            <label className="text-sm font-sans font-semibold text-gray-700">Diagnóstico</label>
            <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
            <textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ej: Caries en pieza 24, se recomienda obturación..."
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
            </div>
            </div>

            <div className="mb-6">
            <label className="text-sm font-sans font-semibold text-gray-700">Observaciones adicionales</label>
            <div className="relative">
                <UserRoundSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: El paciente llegó reportando sensibilidad al frío. Se aplicó anestesia local sin complicaciones..."
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
            </div>
            </div>

            <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-sans font-bold text-gray-900">Tratamientos Realizados</h3>
                <button
                    type="button"
                    onClick={agregarLinea}
                    className="flex items-center gap-1 text-sm font-sans font-semibold text-clinica-dark hover:underline"
                >
                    <Plus size={16} /> Agregar Tratamiento
                </button>
            </div>

            {lineas.length === 0 && (
                <p className="text-sm text-gray-400 font-sans">No se han agregado tratamientos.</p>
            )}

            <div className="flex flex-col gap-3">
                {lineas.map((linea) => (
                    <div key={linea.key} className="flex gap-3 items-start border border-gray-100 rounded-lg p-3">
                        <select
                            value={linea.id_tratamiento}
                            onChange={(e) => actualizarLinea(linea.key, "id_tratamiento", e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                        >
                            <option value="">Seleccionar tratamiento</option>
                            {tratamientos.map((t) => (
                                <option key={t.id_tratamiento} value={t.id_tratamiento}>
                                    {t.nombre} — L. {t.precio}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            min="1"
                            value={linea.cantidad}
                            onChange={(e) => actualizarLinea(linea.key, "cantidad", Number(e.target.value))}
                            className="w-20 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                        />

                        <input
                            type="text"
                            placeholder="Notas"
                            value={linea.observaciones}
                            onChange={(e) => actualizarLinea(linea.key, "observaciones", e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                        />

                        <button type="button" onClick={() => quitarLinea(linea.key)} className="text-gray-400 hover:text-red-600 mt-2">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            </div>

            <button
            onClick={handleSubmit}
            disabled={pending}
            className="bg-clinica-dark text-white font-sans font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
            >
            {pending ? "Guardando consulta..." : "Guardar Consulta"}
            </button>
        </div>
    );
}