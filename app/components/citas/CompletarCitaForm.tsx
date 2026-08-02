"use client";
import { useState, useRef } from "react";
import { completarCitaCompleta } from "@/app/actions/consultas";
import { Plus, Trash2, FingerprintPattern, ClipboardPlus} from "lucide-react";
import { useRouter } from "next/navigation";

type Tratamiento = { id_tratamiento: string; nombre: string; precio: number };
type Producto = { id_producto: string; nombre: string; precio: number; stock: number };

type LineaTratamiento = { key: number; id_tratamiento: string; cantidad: number; observaciones: string };
type LineaProducto = { key: number; id_producto: string; cantidad: number; observaciones: string };

export default function CompletarCitaForm({
  idCita,
  idOdontologo,
  idPaciente,
  medicamentosIniciales,
  observacionesExpedienteIniciales,
  tratamientosDisponibles,
  productosDisponibles,
}: {
  idCita: string;
  idOdontologo: string;
  idPaciente: string;
  medicamentosIniciales: string | null;
  observacionesExpedienteIniciales: string | null;
  tratamientosDisponibles: Tratamiento[];
  productosDisponibles: Producto[];
}) {
  const router = useRouter();
  const contadorRef = useRef(0);
  function siguienteKey() {
    contadorRef.current += 1;
    return contadorRef.current;
  }

  const [medicamentos, setMedicamentos] = useState(medicamentosIniciales ?? "");
  const [obsExpediente, setObsExpediente] = useState(observacionesExpedienteIniciales ?? "");
  const [diagnostico, setDiagnostico] = useState("");
  const [obsConsulta, setObsConsulta] = useState("");
  const [lineasTratamiento, setLineasTratamiento] = useState<LineaTratamiento[]>([]);
  const [lineasProducto, setLineasProducto] = useState<LineaProducto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function agregarTratamiento() {
    setLineasTratamiento((prev) => [...prev, { key: siguienteKey(), id_tratamiento: "", cantidad: 1, observaciones: "" }]);
  }
  function quitarTratamiento(key: number) {
    setLineasTratamiento((prev) => prev.filter((l) => l.key !== key));
  }
  function actualizarTratamiento(key: number, campo: keyof LineaTratamiento, valor: string | number) {
    setLineasTratamiento((prev) => prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l)));
  }

  function agregarProducto() {
    setLineasProducto((prev) => [...prev, { key: siguienteKey(), id_producto: "", cantidad: 1, observaciones: "" }]);
  }
  function quitarProducto(key: number) {
    setLineasProducto((prev) => prev.filter((l) => l.key !== key));
  }
  function actualizarProducto(key: number, campo: keyof LineaProducto, valor: string | number) {
    setLineasProducto((prev) => prev.map((l) => (l.key === key ? { ...l, [campo]: valor } : l)));
  }

  async function handleSubmit() {
    setError(null);

    if (!diagnostico.trim()) return setError("El diagnóstico es obligatorio");
    if (lineasTratamiento.length === 0) {
      return setError("Agrega al menos un tratamiento");
    }
    if (lineasTratamiento.some((l) => !l.id_tratamiento)) return setError("Completa el tratamiento en todas las filas");
    if (lineasProducto.some((l) => !l.id_producto)) return setError("Completa el producto en todas las filas");

    for (const l of lineasProducto) {
      const producto = productosDisponibles.find((p) => p.id_producto === l.id_producto);
      if (producto && l.cantidad > producto.stock) {
        return setError(`Stock insuficiente de "${producto.nombre}" (disponible: ${producto.stock})`);
      }
    }

    setPending(true);
    const result = await completarCitaCompleta({
      id_cita: idCita,
      id_odontologo: idOdontologo,
      id_paciente: idPaciente,
      medicamentos_actuales: medicamentos,
      observaciones_expediente: obsExpediente,
      diagnostico,
      observaciones_consulta: obsConsulta,
      tratamientos: lineasTratamiento.map(({ id_tratamiento, cantidad, observaciones }) => ({ id_tratamiento, cantidad, observaciones })),
      productos: lineasProducto.map(({ id_producto, cantidad, observaciones }) => ({ id_producto, cantidad, observaciones })),
    });
    setPending(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push(`/dashboard/citas/${idCita}`);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex items-center gap-2 mb-3">
                    <FingerprintPattern size={20} className="text-clinica-dark" />
                    <p className="text-lg font-sans font-bold text-gray-900">Actualizar Expediente</p>
                  </div>
      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1">Medicamentos actuales</label>
        <textarea
          value={medicamentos}
          onChange={(e) => setMedicamentos(e.target.value)}
          placeholder="Ej: Ninguno reportado, o listar medicamentos..."
          className="w-full border border-gray-300 rounded-lg p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark min-h-16"
        />
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1">Observaciones del Expediente</label>
        <textarea
          value={obsExpediente}
          onChange={(e) => setObsExpediente(e.target.value)}
          placeholder="Antecedentes, alergias, condiciones relevantes..."
          className="w-full border border-gray-300 rounded-lg p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark min-h-16"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
                    <ClipboardPlus size={20} className="text-clinica-dark" />
                    <p className="text-lg font-sans font-bold text-gray-900">Consulta</p>
                  </div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1">
          Diagnóstico <span className="text-red-500">*</span>
        </label>
        <textarea
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          placeholder="Ej. Caries en pieza 36, se recomienda obturación..."
          className="w-full border border-gray-300 rounded-lg p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark min-h-20"
        />
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-gray-700 mb-1">Observaciones de la Consulta (opcional)</label>
        <textarea
          value={obsConsulta}
          onChange={(e) => setObsConsulta(e.target.value)}
          placeholder="Notas adicionales de la consulta..."
          className="w-full border border-gray-300 rounded-lg p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark min-h-16"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-sans font-semibold text-gray-700">Tratamientos Realizados</label>
          <button type="button" onClick={agregarTratamiento} className="flex items-center gap-1 text-sm font-sans font-semibold text-clinica-dark hover:underline">
            <Plus size={16} /> Agregar Tratamiento
          </button>
        </div>
        {lineasTratamiento.length === 0 && <p className="text-sm text-gray-400 font-sans">No se han agregado tratamientos.</p>}
        <div className="flex flex-col gap-3">
          {lineasTratamiento.map((linea) => (
            <div key={linea.key} className="flex gap-2 items-start border border-gray-200 rounded-lg p-3">
              <select
                value={linea.id_tratamiento}
                onChange={(e) => actualizarTratamiento(linea.key, "id_tratamiento", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm"
              >
                <option value="">Seleccionar tratamiento</option>
                {tratamientosDisponibles.map((t) => (
                  <option key={t.id_tratamiento} value={t.id_tratamiento}>{t.nombre} — L. {t.precio}</option>
                ))}
              </select>
              <input type="number" min="1" value={linea.cantidad} onChange={(e) => actualizarTratamiento(linea.key, "cantidad", Number(e.target.value))} className="w-16 border border-gray-300 rounded-lg p-2 font-sans text-sm" />
              <input type="text" placeholder="Notas" value={linea.observaciones} onChange={(e) => actualizarTratamiento(linea.key, "observaciones", e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm" />
              <button type="button" onClick={() => quitarTratamiento(linea.key)} className="text-gray-400 hover:text-red-600 mt-2 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-sans font-semibold text-gray-700">Productos Utilizados</label>
          <button type="button" onClick={agregarProducto} className="flex items-center gap-1 text-sm font-sans font-semibold text-clinica-dark hover:underline">
            <Plus size={16} /> Agregar Producto
          </button>
        </div>
        {lineasProducto.length === 0 && <p className="text-sm text-gray-400 font-sans">No se han agregado productos.</p>}
        <div className="flex flex-col gap-3">
          {lineasProducto.map((linea) => {
            const productoSel = productosDisponibles.find((p) => p.id_producto === linea.id_producto);
            return (
              <div key={linea.key} className="flex gap-2 items-start border border-gray-200 rounded-lg p-3">
                <select
                  value={linea.id_producto}
                  onChange={(e) => actualizarProducto(linea.key, "id_producto", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm"
                >
                  <option value="">Seleccionar producto</option>
                  {productosDisponibles.map((p) => (
                    <option key={p.id_producto} value={p.id_producto} disabled={p.stock <= 0}>
                      {p.nombre} — L. {p.precio} ({p.stock <= 0 ? "sin stock" : `${p.stock} disp.`})
                    </option>
                  ))} 
                </select>
                <input type="number" min="1" max={productoSel?.stock ?? undefined} value={linea.cantidad} onChange={(e) => actualizarProducto(linea.key, "cantidad", Number(e.target.value))} className="w-16 border border-gray-300 rounded-lg p-2 font-sans text-sm" />
                <input type="text" placeholder="Notas" value={linea.observaciones} onChange={(e) => actualizarProducto(linea.key, "observaciones", e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2 font-sans text-sm" />
                <button type="button" onClick={() => quitarProducto(linea.key)} className="text-gray-400 hover:text-red-600 mt-2 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Único botón: guarda TODO junto */}
      <button
        onClick={handleSubmit}
        disabled={pending}
        className="bg-clinica-dark text-white font-sans font-bold py-3 rounded-lg disabled:opacity-50 mt-2"
      >
        {pending ? "Guardando..." : "Marcar como Completada"}
      </button>
    </div>
  );
} 