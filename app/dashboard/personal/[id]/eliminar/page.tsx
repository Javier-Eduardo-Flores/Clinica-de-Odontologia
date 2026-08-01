"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarRecepcionista } from "@/app/actions/recepcionistas";
import ConfirmDialog from "@/app/components/confirmdialog";

export default function EliminarRecepcionistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleConfirm() {
    const { id } = await params;
    startTransition(async () => {
      const result = await eliminarRecepcionista(id);
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        router.push("/dashboard/personal");
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ConfirmDialog
        open={true}
        title="Eliminar Recepcionista"
        message="¿Estás seguro de que deseas eliminar esta recepcionista? Esta acción no se puede deshacer."
        onConfirm={handleConfirm}
        onCancel={() => router.back()}
        pending={pending}
      />
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg font-sans text-sm shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
