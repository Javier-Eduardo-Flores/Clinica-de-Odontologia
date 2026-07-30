// app/forgot-password/page.tsx
"use client";

import { useActionState } from "react";
import { recuperarPassword } from "@/app/actions/auth";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(recuperarPassword, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-sans font-bold text-gray-900 mb-1">¿Olvidaste tu contraseña?</h1>
          <p className="text-gray-500 font-sans text-sm">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.
          </p>
        </div>

        {state?.error && (
          <p className="text-red-500 text-sm font-sans bg-red-50 p-3 rounded-lg mb-4 text-center">
            {state.error}
          </p>
        )}

        {state?.success && (
          <p className="text-green-600 text-sm font-sans bg-green-50 p-3 rounded-lg mb-4 text-center">
            ¡Correo enviado! Revisa tu bandeja de entrada para continuar.
          </p>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-sans font-semibold text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="nombre@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg py-2 px-3 font-sans focus:outline-none focus:ring-2 focus:ring-clinica-dark"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full font-sans font-bold bg-clinica-dark text-white py-2.5 rounded-lg hover:bg-clinica-medium transition-colors disabled:opacity-50 mt-2"
          >
            {pending ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
} 