"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function RelojEnVivo() {
  const [hora, setHora] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");

  useEffect(() => {
    const actualizar = () => {
      const ahora = new Date();
      setHora(
        ahora.toLocaleTimeString("es-HN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setFecha(
        ahora.toLocaleDateString("es-HN", {
          weekday: "long",
          day: "2-digit",
          month: "short",
        })
      );
    };

    actualizar();
    const intervalo = setInterval(actualizar, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border-l-4 border-clinica-dark p-5 flex-1">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Clock size={20} className="text-clinica-dark" />
        </div>
      </div>
      <p className="text-3xl font-sans font-bold text-gray-900 tabular-nums">
        {hora || "--:--:--"}
      </p>
      <p className="text-sm text-gray-500 font-sans capitalize">
        {fecha || "Hora actual"}
      </p>
    </div>
  );
}