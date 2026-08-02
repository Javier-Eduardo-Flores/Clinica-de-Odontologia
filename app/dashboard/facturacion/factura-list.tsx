"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  crearFactura,
  actualizarEstadoFactura,
  eliminarFactura,
  registrarPago,
  type FacturaState,
  type PagoState,
} from "@/app/actions/facturacion";
import {
  Receipt,
  BanknoteArrowUp,
  Banknote,
  CreditCard,
  Eye,
  Pencil,
  Trash2,
  X,
  Search,
  Plus,
  ChevronDown,
  Trash,
  Check,
} from "lucide-react";

type Perfil = { nombre: string; apellido: string; rol: string };

type Factura = {
  id_factura: string;
  id_paciente: string;
  no_factura?: string;
  tipo_documento?: string;
  fecha: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  estado: number;
};

type Paciente = {
  id_paciente: string;
  primer_nombre: string;
  primer_apellido: string;
};

type Tratamiento = { id_tratamiento: string; nombre: string; precio: number };
type Producto = { id_producto: string; nombre: string; precio: number };
type Descuento = { id_descuento: string; nombre: string; tipo: "%" | "Lps"; valor: number };
type MetodoPago = { id_metodo_pago: string; nombre: string };

type DetalleLine = {
  key: string;
  tipo: "tratamiento" | "producto";
  id_item: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  id_descuento: string;
  monto_descuento: number;
};

const ESTADO_BADGE: Record<number, { label: string; classes: string }> = {
  1: { label: "Pendiente", classes: "bg-amber-50 text-amber-700" },
  2: { label: "Pagada", classes: "bg-green-50 text-green-700" },
  3: { label: "Cancelada", classes: "bg-red-50 text-red-700" },
};

export default function FacturaList({
  perfil,
  facturas,
  pacientes,
  tratamientos,
  productos,
  descuentos,
  metodosPago,
  pagosPorFactura,
  detallesPorFactura,
  totalIngresos,
  facturasPendientes,
  facturasPagadas,
  dbErrors,
}: {
  perfil: Perfil;
  facturas: Factura[];
  pacientes: Paciente[];
  tratamientos: Tratamiento[];
  productos: Producto[];
  descuentos: Descuento[];
  metodosPago: MetodoPago[];
  pagosPorFactura: Record<string, number>;
  detallesPorFactura: Record<string, any[]>;
  totalIngresos: number;
  facturasPendientes: number;
  facturasPagadas: number;
  dbErrors?: Record<string, string | undefined>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pagoModal, setPagoModal] = useState<Factura | null>(null);
  const searchParams = useSearchParams();
  const [detalleOpen, setDetalleOpen] = useState<string | null>(
    searchParams.get("factura")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<number | "">("");

  const [createState, createAction, createPending] = useActionState<FacturaState, FormData>(
    crearFactura,
    null
  );

  const router = useRouter();

  useEffect(() => {
    if (createState?.success) {
      setModalOpen(false);
      router.refresh();
    }
  }, [createState, router]);

  const buscarPaciente = (id: string) => pacientes.find(pa => pa.id_paciente === id);

  const facturasFiltradas = facturas.filter((f) => {
    const p = buscarPaciente(f.id_paciente);
    const nombre = p ? `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase() : "";
    const noFactura = (f.no_factura || "").toLowerCase();
    const termino = searchTerm.toLowerCase();
    const matchSearch = nombre.includes(termino) || noFactura.includes(termino);
    const matchEstado = estadoFilter === "" || f.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  const saldoPendiente = (f: Factura) => {
    const pagado = pagosPorFactura[f.id_factura] || 0;
    return Math.max(0, Number(f.total) - pagado);
  };

  const cambiarEstado = async (id: string, estado: number) => {
    await actualizarEstadoFactura(id, estado);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6 -mt-2">
        <div className="relative flex-1 max-w-xl">
          <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por paciente o No. de factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-sans font-semibold text-gray-900">{perfil.nombre} {perfil.apellido}</p>
            <p className="text-xs text-gray-400 capitalize">{perfil.rol}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-sans font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-500 font-sans mt-1">Gestión de facturas y pagos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-clinica-dark text-white font-sans font-semibold px-4 py-2.5 rounded-lg hover:bg-clinica-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Nueva Factura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-clinica-dark p-5">
          <p className="text-sm text-gray-500 font-sans">Total Facturado</p>
          <p className="text-3xl font-sans font-bold text-gray-900">
            L. {totalIngresos.toLocaleString("es", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-amber-500 p-5">
          <p className="text-sm text-gray-500 font-sans">Facturas Pendientes</p>
          <p className="text-3xl font-sans font-bold text-gray-900">{facturasPendientes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-5">
          <p className="text-sm text-gray-500 font-sans">Facturas Pagadas</p>
          <p className="text-3xl font-sans font-bold text-gray-900">{facturasPagadas}</p>
        </div>
      </div>

      {dbErrors && Object.values(dbErrors).some(Boolean) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-sans font-semibold text-red-700 mb-1">Errores al cargar datos:</p>
          <ul className="text-xs text-red-600 font-sans space-y-1">
            {Object.entries(dbErrors).map(([key, msg]) =>
              msg ? <li key={key}><strong>{key}:</strong> {msg}</li> : null
            )}
          </ul>
          <p className="text-xs text-red-500 font-sans mt-2">Revisa las políticas RLS en Supabase para estas tablas.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-sans font-bold text-gray-900">Todas las Facturas</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value ? Number(e.target.value) : "")}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 font-sans text-gray-600 focus:outline-none focus:ring-2 focus:ring-clinica-dark appearance-none bg-white pr-8"
              >
                <option value="">Todos</option>
                <option value="1">Pendiente</option>
                <option value="2">Pagada</option>
                <option value="3">Cancelada</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {facturas.length === 0 ? (
          <div className="text-center py-16">
            <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-sans text-lg">No hay facturas registradas</p>
            <p className="text-gray-400 font-sans text-sm mt-1">Cree su primera factura para comenzar</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                <th className="py-3">No. Factura</th>
                <th className="py-3">Paciente</th>
                <th className="py-3">Fecha</th>
                <th className="py-3">Total</th>
                <th className="py-3">Pagado</th>
                <th className="py-3">Saldo</th>
                <th className="py-3">Estado</th>
                <th className="py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map((f) => {
                const p = buscarPaciente(f.id_paciente);
                const badge = ESTADO_BADGE[f.estado] ?? { label: "Desconocido", classes: "bg-gray-100 text-gray-600" };
                const noFactura = f.no_factura || `FAC-${f.fecha.slice(0, 7).replace("-", "")}-${f.id_factura.slice(0, 8).toUpperCase()}`;
                const pagado = pagosPorFactura[f.id_factura] || 0;
                const saldo = saldoPendiente(f);
                return (
                  <tr key={f.id_factura} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4">
                      <span className="font-sans font-mono text-xs text-gray-500 font-semibold">{noFactura}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-clinica-light flex items-center justify-center font-sans font-bold text-clinica-dark text-sm shrink-0">
                          {p ? `${p.primer_nombre?.[0] ?? ""}${p.primer_apellido?.[0] ?? ""}` : "??"}
                        </div>
                        <span className="font-sans font-semibold text-gray-900 text-sm">
                          {p ? `${p.primer_nombre} ${p.primer_apellido}` : "Sin paciente"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 font-sans text-sm">
                      {new Date(f.fecha).toLocaleDateString("es")}
                    </td>
                    <td className="py-4 font-sans font-bold text-gray-900">
                      L. {Number(f.total).toLocaleString("es", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 font-sans text-green-600 text-sm">
                      L. {pagado.toLocaleString("es", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 font-sans text-sm" data-saldo={saldo}>
                      {saldo > 0 ? (
                        <span className="text-amber-600 font-semibold">
                          L. {saldo.toLocaleString("es", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-green-600">L. 0.00</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetalleOpen(detalleOpen === f.id_factura ? null : f.id_factura)}
                          className="p-1.5 text-gray-400 hover:text-clinica-dark hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        {f.estado === 1 && (
                          <>
                            <button
                              onClick={() => setPagoModal(f)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                              title="Registrar pago"
                            >
                              <BanknoteArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => cambiarEstado(f.id_factura, 3)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancelar factura"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {f.estado !== 2 && (
                          <button
                            onClick={async () => {
                              if (confirm("¿Está seguro de eliminar esta factura?")) {
                                const res = await eliminarFactura(f.id_factura);
                                if (res?.error) alert(res.error);
                                router.refresh();
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <CrearFacturaModal
          pacientes={pacientes}
          tratamientos={tratamientos}
          productos={productos}
          descuentos={descuentos}
          onClose={() => setModalOpen(false)}
          createAction={createAction}
          createPending={createPending}
          createState={createState}
        />
      )}

      {detalleOpen && (() => {
        const f = facturas.find((f) => f.id_factura === detalleOpen);
        if (!f) return null;
        return (
          <DetalleModal
            factura={f}
            paciente={buscarPaciente(f.id_paciente)}
            detalles={detallesPorFactura[detalleOpen] || []}
            pagado={pagosPorFactura[detalleOpen] || 0}
            onClose={() => setDetalleOpen(null)}
          />
        );
      })()}

      {pagoModal && (
        <PagoModal
          factura={pagoModal}
          metodosPago={metodosPago}
          descuentos={descuentos}
          pagosPorFactura={pagosPorFactura}
          onClose={() => setPagoModal(null)}
        />
      )}
    </>
  );
}

function PagoModal({
  factura,
  metodosPago,
  descuentos,
  pagosPorFactura,
  onClose,
}: {
  factura: Factura;
  metodosPago: MetodoPago[];
  descuentos: Descuento[];
  pagosPorFactura: Record<string, number>;
  onClose: () => void;
}) {
  const pagado = pagosPorFactura[factura.id_factura] || 0;
  const pendiente = Math.max(0, Number(factura.total) - pagado);
  const [pagoState, pagoAction, pagoPending] = useActionState<PagoState, FormData>(registrarPago, null);
  const router = useRouter();

  const [idMetodoPago, setIdMetodoPago] = useState("");
  const [idDescuento, setIdDescuento] = useState("");
  const [monto, setMonto] = useState("");
  const [montoTocado, setMontoTocado] = useState(false);

  const metodoSeleccionado = metodosPago.find((m) => m.id_metodo_pago === idMetodoPago);
  const esTarjetaCredito = (metodoSeleccionado?.nombre ?? "").toLowerCase().includes("tarjeta");

  const descuentoSeleccionado = descuentos.find((d) => d.id_descuento === idDescuento);
  const montoDescuento = descuentoSeleccionado
    ? Math.min(
        pendiente,
        descuentoSeleccionado.tipo === "%"
          ? (pendiente * Number(descuentoSeleccionado.valor)) / 100
          : Number(descuentoSeleccionado.valor)
      )
    : 0;
  const pendienteConDescuento = Math.max(0, pendiente - montoDescuento);

  // Sugiere el monto a pagar (saldo con descuento) mientras el usuario no lo edite manualmente
  useEffect(() => {
    if (!montoTocado) {
      setMonto(pendienteConDescuento > 0 ? pendienteConDescuento.toFixed(2) : "");
    }
  }, [pendienteConDescuento, montoTocado]);

  useEffect(() => {
    if (pagoState?.success) {
      onClose();
      router.refresh();
    }
  }, [pagoState, router, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Banknote size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-gray-900">Registrar Pago</h3>
            <p className="text-xs text-gray-500 font-sans">{factura.no_factura || "Factura"}</p>
            {factura.tipo_documento && (
              <p className="text-xs text-gray-400 font-sans">
                {factura.tipo_documento === "01" ? "Factura" : "Recibo por Honorarios Profesionales"}
              </p>
            )}
          </div>
        </div>

        <form action={pagoAction} className="flex flex-col gap-4">
          <input type="hidden" name="id_factura" value={factura.id_factura} />
          <input type="hidden" name="id_descuento" value={idDescuento} />

          {pagoState?.error && (
            <p className="text-red-500 text-sm font-sans text-center bg-red-50 rounded-lg py-2">{pagoState.error}</p>
          )}

          <div>
            <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">Método de Pago</label>
            <select
              name="id_metodo_pago"
              required
              value={idMetodoPago}
              onChange={(e) => setIdMetodoPago(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            >
              <option value="">Seleccione un método</option>
              {metodosPago.map((m) => (
                <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {esTarjetaCredito && (
            <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3 bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-inter font-semibold text-clinica-accent">
                <CreditCard size={16} />
                Datos de la tarjeta
              </div>
              <div>
                <label className="block text-xs font-sans text-gray-500 mb-1">Número de tarjeta</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                  onChange={(e) => {
                    // formatea en grupos de 4 solo para mostrar en pantalla
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                    e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-gray-500 mb-1">Nombre en la tarjeta</label>
                <input
                  type="text"
                  autoComplete="cc-name"
                  placeholder="Como aparece en la tarjeta"
                  className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-sans text-gray-500 mb-1">Vencimiento</label>
                  <input
                    type="text"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                      e.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-sans text-gray-500 mb-1">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="•••"
                    maxLength={4}
                    className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-snug">
                Por seguridad, el número completo y el CVV no se guardan. Solo se registra una referencia con los
                últimos 4 dígitos.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">
              Descuento <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <select
              value={idDescuento}
              onChange={(e) => setIdDescuento(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            >
              <option value="">Sin descuento</option>
              {descuentos.map((d) => (
                <option key={d.id_descuento} value={d.id_descuento}>
                  {d.nombre} ({d.tipo === "%" ? `${d.valor}%` : `L. ${d.valor}`})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-2">
            <div className="flex justify-between text-sm font-sans">
              <span className="text-gray-600">Total factura</span>
              <span className="font-semibold text-gray-900">L. {Number(factura.total).toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-sans mt-1">
              <span className="text-gray-600">Ya pagado</span>
              <span className="font-semibold text-green-600">L. {pagado.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-sans mt-1">
              <span className="font-semibold text-gray-700">Saldo pendiente</span>
              <span className="font-bold text-amber-600">L. {pendiente.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            {montoDescuento > 0 && (
              <>
                <div className="flex justify-between text-sm font-sans mt-1 text-green-600">
                  <span>Descuento ({descuentoSeleccionado?.nombre})</span>
                  <span>- L. {montoDescuento.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm font-sans mt-1 pt-1 border-t border-blue-200">
                  <span className="font-semibold text-gray-700">Saldo con descuento</span>
                  <span className="font-bold text-clinica-dark">L. {pendienteConDescuento.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">Monto a pagar</label>
            <input
              type="number"
              name="monto"
              step="0.01"
              min="0.01"
              max={pendienteConDescuento || pendiente}
              required
              placeholder="0.00"
              value={monto}
              onChange={(e) => {
                setMontoTocado(true);
                setMonto(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">
              Referencia <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="referencia"
              placeholder="No. de operación, voucher, etc."
              className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">
              Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="observaciones"
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-sans font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={pagoPending} className="flex-1 py-2.5 bg-green-600 text-white font-sans font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer">
              {pagoPending ? "Procesando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetalleModal({
  factura,
  paciente,
  detalles,
  pagado,
  onClose,
}: {
  factura: Factura;
  paciente: Paciente | undefined;
  detalles: any[];
  pagado: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Receipt size={20} className="text-clinica-dark" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-gray-900">Detalle de Factura</h3>
            <p className="text-xs text-gray-500 font-mono">{factura.no_factura}</p>
            {factura.tipo_documento && (
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                {factura.tipo_documento === "01" ? "Factura" : "Recibo por Honorarios Profesionales"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-sans">Paciente</p>
              <p className="font-sans font-semibold text-gray-900">
                {paciente ? `${paciente.primer_nombre} ${paciente.primer_apellido}` : "Sin paciente"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-sans">Fecha</p>
              <p className="font-sans text-gray-900">{new Date(factura.fecha).toLocaleDateString("es")}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-sans mb-2">Líneas de la factura</p>
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-2">Item</th>
                  <th className="py-2 w-16 text-right">Cant.</th>
                  <th className="py-2 w-24 text-right">P. Unit.</th>
                  <th className="py-2 w-24 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d, i) => {
                  const nombre = d.tratamiento?.nombre || d.producto?.nombre || "—";
                  const subtotal = Number(d.cantidad) * Number(d.precio_unitario) - Number(d.monto_descuento);
                  return (
                    <tr key={i} className="border-b border-gray-50 text-sm">
                      <td className="py-2 font-sans text-gray-900">{nombre}</td>
                      <td className="py-2 font-sans text-gray-600 text-right">{d.cantidad}</td>
                      <td className="py-2 font-sans text-gray-600 text-right">L. {Number(d.precio_unitario).toLocaleString("es", { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 font-sans font-semibold text-gray-900 text-right">L. {subtotal.toLocaleString("es", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm font-sans text-gray-600">
              <span>Subtotal</span>
              <span>L. {Number(factura.subtotal).toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-sans text-gray-600">
              <span>ISV 15%</span>
              <span>L. {Number(factura.impuestos).toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            {Number(factura.descuento) > 0 && (
              <div className="flex justify-between text-sm font-sans text-green-600">
                <span>Descuento</span>
                <span>- L. {Number(factura.descuento).toLocaleString("es", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-sans font-bold text-gray-900 border-t border-gray-200 pt-1">
              <span>Total</span>
              <span>L. {Number(factura.total).toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-sans text-green-600">
              <span>Pagado</span>
              <span>L. {pagado.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
            </div>
            {Number(factura.total) - pagado > 0 && (
              <div className="flex justify-between text-sm font-sans text-amber-600 font-semibold">
                <span>Saldo pendiente</span>
                <span>L. {(Number(factura.total) - pagado).toLocaleString("es", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-sans font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function CrearFacturaModal({
  pacientes,
  tratamientos,
  productos,
  descuentos,
  onClose,
  createAction,
  createPending,
  createState,
}: {
  pacientes: Paciente[];
  tratamientos: Tratamiento[];
  productos: Producto[];
  descuentos: Descuento[];
  onClose: () => void;
  createAction: (payload: FormData) => void;
  createPending: boolean;
  createState: FacturaState;
}) {
  const [lineas, setLineas] = useState<DetalleLine[]>([
    { key: crypto.randomUUID(), tipo: "tratamiento", id_item: "", nombre: "", precio_unitario: 0, cantidad: 1, id_descuento: "", monto_descuento: 0 },
  ]);
  const [rtnPaciente, setRtnPaciente] = useState("");

  const agregarLinea = () => {
    setLineas([...lineas, { key: crypto.randomUUID(), tipo: "tratamiento", id_item: "", nombre: "", precio_unitario: 0, cantidad: 1, id_descuento: "", monto_descuento: 0 }]);
  };

  const eliminarLinea = (key: string) => {
    if (lineas.length <= 1) return;
    setLineas(lineas.filter((l) => l.key !== key));
  };

  const actualizarLinea = (key: string, campo: keyof DetalleLine, valor: string | number) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const updated = { ...l, [campo]: valor };

        if (campo === "tipo") {
          updated.id_item = "";
          updated.nombre = "";
          updated.precio_unitario = 0;
        }

        if (campo === "id_item") {
          const id = valor as string;
          if (updated.tipo === "tratamiento") {
            const t = tratamientos.find((tr) => tr.id_tratamiento === id);
            if (t) {
              updated.nombre = t.nombre;
              updated.precio_unitario = t.precio;
            }
          } else {
            const pr = productos.find((p) => p.id_producto === id);
            if (pr) {
              updated.nombre = pr.nombre;
              updated.precio_unitario = pr.precio;
            }
          }
        }

        if (campo === "id_descuento") {
          const d = descuentos.find((ds) => ds.id_descuento === (valor as string));
          if (d) {
            updated.monto_descuento = d.tipo === "%"
              ? updated.precio_unitario * updated.cantidad * (d.valor / 100)
              : d.valor;
          } else {
            updated.monto_descuento = 0;
          }
        }

        return updated;
      })
    );
  };

  const TASA_ISV = 0.15;
  const subtotal = lineas.reduce((s, l) => s + l.precio_unitario * l.cantidad, 0);
  const baseImponible = subtotal;
  const isvMonto = baseImponible * TASA_ISV;
  const descuentoTotal = lineas.reduce((s, l) => s + l.monto_descuento, 0);
  const total = baseImponible + isvMonto - descuentoTotal;

  const handleSubmit = (formData: FormData) => {
    const datos = lineas.map((l) => ({
      id_tratamiento: l.tipo === "tratamiento" ? l.id_item : undefined,
      id_producto: l.tipo === "producto" ? l.id_item : undefined,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      id_descuento: l.id_descuento || undefined,
      monto_descuento: l.monto_descuento,
    }));
    formData.set("detalles", JSON.stringify(datos));
    formData.set("impuestos", String(isvMonto));
    formData.set("rtn_paciente", rtnPaciente);
    createAction(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Receipt size={20} className="text-clinica-dark" />
          </div>
          <h3 className="text-xl font-sans font-bold text-gray-900">Nueva Factura</h3>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {createState?.error && (
            <p className="text-red-500 text-sm font-sans text-center bg-red-50 rounded-lg py-2">{createState.error}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">Paciente</label>
              {pacientes.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-sans font-semibold text-amber-700">No hay pacientes disponibles</p>
                  <p className="text-xs text-amber-600 font-sans mt-1">
                    Asegúrate de que la tabla <strong>pacientes</strong> tenga registros y que las políticas RLS permitan SELECT.
                  </p>
                </div>
              ) : (
                <select
                  name="id_paciente"
                  required
                  defaultValue=""
                  className={`w-full border rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 ${createState?.fieldErrors?.id_paciente ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-clinica-dark"}`}
                >
                  <option value="">Seleccione un paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id_paciente} value={p.id_paciente}>{p.primer_nombre} {p.primer_apellido}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">
                RTN del Paciente <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={rtnPaciente}
                onChange={(e) => setRtnPaciente(e.target.value)}
                placeholder="0801-0000-000000"
                className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-48">
              <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">Tipo Documento</label>
              <select
                name="tipo_documento"
                defaultValue="01"
                className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
              >
                <option value="01">01 - Factura</option>
                <option value="02">02 - Recibo Honorarios</option>
              </select>
            </div>
            <div className="w-48">
              <label className="block text-sm font-inter font-semibold text-clinica-accent mb-1">Fecha</label>
              <input
                type="date"
                name="fecha"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border border-gray-300 rounded-lg py-2 px-2 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-inter font-semibold text-clinica-accent">Detalles</label>
              <button type="button" onClick={agregarLinea} className="text-xs font-sans font-semibold text-clinica-dark hover:text-clinica-medium flex items-center gap-1 cursor-pointer">
                <Plus size={14} /> Agregar línea
              </button>
            </div>
            {createState?.fieldErrors?.detalles && (
              <p className="text-red-500 text-xs mb-2">{createState.fieldErrors.detalles}</p>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-sans font-bold text-gray-400 uppercase bg-gray-50">
                    <th className="py-2 px-2 w-24">Tipo</th>
                    <th className="py-2 px-2">Item</th>
                    <th className="py-2 px-2 w-20">Cant.</th>
                    <th className="py-2 px-2 w-24">Precio Unit.</th>
                    <th className="py-2 px-2 w-28">Descuento</th>
                    <th className="py-2 px-2 w-24">Subtotal</th>
                    <th className="py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l) => (
                    <tr key={l.key} className="border-t border-gray-100">
                      <td className="py-2 px-2">
                        <select
                          value={l.tipo}
                          onChange={(e) => actualizarLinea(l.key, "tipo", e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded py-1.5 px-1 font-sans focus:outline-none focus:ring-1 focus:ring-clinica-dark"
                        >
                          <option value="tratamiento">Tratamiento</option>
                          <option value="producto">Producto</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={l.id_item}
                          onChange={(e) => actualizarLinea(l.key, "id_item", e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded py-1.5 px-1 font-sans focus:outline-none focus:ring-1 focus:ring-clinica-dark"
                        >
                          <option value="">Seleccionar</option>
                          {(l.tipo === "tratamiento" ? tratamientos : productos).map((item) => {
                            const id = "id_tratamiento" in item ? item.id_tratamiento : item.id_producto;
                            return (
                              <option key={id} value={id}>
                                {item.nombre} - L. {Number(item.precio).toLocaleString("es", { minimumFractionDigits: 2 })}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="1"
                          value={l.cantidad}
                          onChange={(e) => actualizarLinea(l.key, "cantidad", Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-xs border border-gray-300 rounded py-1.5 px-1 font-sans focus:outline-none focus:ring-1 focus:ring-clinica-dark"
                        />
                      </td>
                      <td className="py-2 px-2 text-xs font-sans text-gray-700">
                        L. {l.precio_unitario.toLocaleString("es", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={l.id_descuento}
                          onChange={(e) => actualizarLinea(l.key, "id_descuento", e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded py-1.5 px-1 font-sans focus:outline-none focus:ring-1 focus:ring-clinica-dark"
                        >
                          <option value="">Sin descuento</option>
                          {descuentos.map((d) => (
                            <option key={d.id_descuento} value={d.id_descuento}>
                              {d.nombre} ({d.tipo === "%" ? `${d.valor}%` : `L${d.valor}`})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2 text-xs font-sans font-semibold text-gray-900">
                        L. {((l.precio_unitario * l.cantidad) - l.monto_descuento).toLocaleString("es", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2">
                        <button
                          type="button"
                          onClick={() => eliminarLinea(l.key)}
                          disabled={lineas.length <= 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-72 space-y-1.5">
              <div className="flex justify-between text-sm font-sans text-gray-600">
                <span>Base Imponible (excluye ISV)</span>
                <span>L. {baseImponible.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-sans text-blue-700">
                <span>
                  ISV 15%
                  
                </span>
                <span>L. {isvMonto.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
              </div>
              {descuentoTotal > 0 && (
                <div className="flex justify-between text-sm font-sans text-green-600">
                  <span>Descuento</span>
                  <span>- L. {descuentoTotal.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-sans font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                <span>Total a pagar</span>
                <span>L. {total.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
              </div>

            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-sans font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={createPending} className="flex-1 py-2.5 bg-clinica-dark text-white font-sans font-semibold rounded-lg hover:bg-clinica-medium transition-colors disabled:opacity-50 cursor-pointer">
              {createPending ? "Guardando..." : "Crear Factura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}