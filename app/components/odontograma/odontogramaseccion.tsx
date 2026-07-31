'use client';
import { useState, useEffect } from 'react';
import { Odontograma } from './Odontograma';
import { PanelEstadoDiente } from './panelestadodiente';
import ActualizarOdontogramaForm from './ActualizarOdontogramaForm';
import type { DienteConEstado } from './odontograma.types';

export default function OdontogramaSection({
    dientes,
    catalogoDientes,
    catalogoEstados,
    idPaciente,
}: {
    dientes: DienteConEstado[];
    catalogoDientes: { id_diente: string; numero_fdi: number; nombre: string }[];
    catalogoEstados: { id_estado_diente: string; nombre: string; color: string | null }[];
    idPaciente: string;
}) {
    const [idSeleccionado, setIdSeleccionado] = useState<string | null>(null);

    const seleccionado = dientes.find((d) => d.id_diente === idSeleccionado) ?? null;

    function handleClicDiente(diente: DienteConEstado) {
        setIdSeleccionado(diente.id_diente);
    }

    function handleCambioSelect(idDiente: string) {
        setIdSeleccionado(idDiente || null);
    }

    return (
        <div className="flex gap-6 items-start mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 flex-[2] min-w-0">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">Odontograma</h2>
            <div className="mb-6">
                <Odontograma
                dientes={dientes}
                seleccionado={seleccionado}
                onSeleccionar={handleClicDiente}
                />
            </div>
            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-sans font-bold text-gray-900 mb-3">Registrar nuevo estado</h3>
                <ActualizarOdontogramaForm
                idPaciente={idPaciente}
                dientes={catalogoDientes}
                estados={catalogoEstados}
                idDienteSeleccionado={seleccionado?.id_diente}
                onCambiarDiente={handleCambioSelect}
                />
            </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 min-w-0">
            <h2 className="text-sm font-sans font-bold text-gray-400 uppercase mb-4">Estado</h2>
            <PanelEstadoDiente diente={seleccionado} />
            </div>
        </div>
    );
}