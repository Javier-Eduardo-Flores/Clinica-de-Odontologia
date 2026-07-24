import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/app/components/sidebar";
import TratamientoForm from "@/app/components/tratamientoform";

export default async function TratamientosPage() {
    const supabase = await createClient();

    const { data: tratamientos } = await supabase
        .from("tratamiento")
        .select("id_tratamiento, nombre, descripcion, precio")
        .order("nombre");

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePath="/dashboard/tratamientos" />

            <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-sans font-bold text-gray-900">Tratamientos y Precios</h1>
                    <p className="text-gray-500 font-sans">Mantén actualizado el arancel odontológico.</p>
                </div>
                <TratamientoForm mode="crear" />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-xs font-sans font-bold text-gray-500 uppercase">
                        <th className="px-6 py-4">Nombre</th>
                        <th className="px-6 py-4">Descripción</th>
                        <th className="px-6 py-4">Precio</th>
                        <th className="px-6 py-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tratamientos?.map((t) => (
                        <tr key={t.id_tratamiento} className="border-b border-gray-100 last:border-0">
                            <td className="px-6 py-4 font-sans font-semibold text-gray-900">{t.nombre}</td>
                            <td className="px-6 py-4 text-gray-600 font-sans text-sm">{t.descripcion}</td>
                            <td className="px-6 py-4 font-sans font-semibold">${Number(t.precio).toLocaleString("es")}</td>
                            <td className="px-6 py-4">
                                <TratamientoForm mode="editar" tratamiento={t} />
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