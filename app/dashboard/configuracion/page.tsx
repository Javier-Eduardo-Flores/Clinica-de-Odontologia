import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/app/components/sidebar";
import ToggleSwitch from "@/app/components/toggleswitch";
import DescuentoForm from "@/app/components/descuentoform";
import MetodoPagoForm from "@/app/components/metodopagoform";

export default async function ConfiguracionPage() {
    const supabase = await createClient();

    const { data: metodosPago } = await supabase.from("metodo_pago").select("id_metodo_pago, nombre, activo");
    const { data: descuentos } = await supabase
        .from("descuento")
        .select("id_descuento, nombre, tipo, valor, fecha_inicio, fecha_fin, activo")
        .order("fecha_inicio", { ascending: false });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/dashboard/configuracion" />

            <div className="flex-1 p-8">
            <h1 className="text-3xl font-sans font-bold text-gray-900 mb-6">Descuentos y Métodos de Pago</h1>


            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-sans font-bold text-gray-900">Métodos de Pago</h2>
                    <MetodoPagoForm />
                </div>
                <div className="flex flex-col gap-3">
                    {metodosPago?.map((m) => (
                        <div key={m.id_metodo_pago} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                        <span className="font-sans font-medium text-gray-900">{m.nombre}</span>
                        <ToggleSwitch id={m.id_metodo_pago} activo={m.activo} tipo="metodo_pago" />
                    </div>
                ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-sans font-bold text-gray-900">Descuentos y Promociones</h2>
                    <DescuentoForm />
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-sans font-bold text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-3">Nombre</th>
                        <th className="py-3">Valor</th>
                        <th className="py-3">Vigencia</th>
                        <th className="py-3">Activo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {descuentos?.map((d) => (
                        <tr key={d.id_descuento} className="border-b border-gray-50 last:border-0">
                            <td className="py-4 font-sans font-semibold text-gray-900">{d.nombre}</td>
                            <td className="py-4 font-sans">
                                {d.tipo === "porcentaje" ? `${d.valor}%` : `$${d.valor}`}
                            </td>
                            <td className="py-4 text-gray-600 font-sans text-sm">
                                {new Date(d.fecha_inicio).toLocaleDateString("es")} — {new Date(d.fecha_fin).toLocaleDateString("es")}
                            </td>
                            <td className="py-4">
                                <ToggleSwitch id={d.id_descuento} activo={d.activo} tipo="descuento" />
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
}