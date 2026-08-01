import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/app/components/sidebar";
import StockEditor from "@/app/components/stockeditor";
import ModalAgregarProducto from "@/app/components/inventario/ModalAgregarProducto";
import BotonEliminar from "@/app/components/inventario/BotonEliminar";

export default async function InventarioPage() {
  const supabase = await createClient();

  const { data: productos } = await supabase
    .from("producto")
    .select("id_producto, nombre, precio, stock, unidad_medida, estado")
    .order("nombre");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath="/dashboard/inventario" />

      <div className="flex-1 p-8">
        {/* Aquí agregamos un flex para separar el título del botón */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-sans font-bold text-gray-900 mb-1">Inventario de Productos</h1>
            <p className="text-gray-500 font-sans">Control de stock en tiempo real.</p>
          </div>
          <ModalAgregarProducto />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs font-sans font-bold text-gray-500 uppercase">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos?.map((p) => {
                const sinStock = p.stock === 0;
                const stockCritico = p.stock > 0 && p.stock <= 5;
                
                return (
                  <tr key={p.id_producto} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-sans font-semibold text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-4 font-sans">L. {Number(p.precio).toLocaleString("es")}</td>
                    <td className="px-6 py-4">
                      <StockEditor id={p.id_producto} stockActual={p.stock} unidad={p.unidad_medida} />
                    </td>
                    <td className="px-6 py-4 flex items-center justify-between">
                      {/* Estado */}
                      <div>
                        {stockCritico ? (
                          <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
                            Stock Crítico
                          </span>
                        ) : sinStock ? (
                          <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                            Sin Stock
                          </span>
                        ) : (
                          <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                            En Stock
                          </span>
                        )}
                      </div>
                      
                      {/* Botón Eliminar alineado a la derecha */}
                      <BotonEliminar idProducto={p.id_producto} nombre={p.nombre} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 