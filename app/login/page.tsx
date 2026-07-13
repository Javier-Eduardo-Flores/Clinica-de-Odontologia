"use client";

import {useActionState, useState} from "react";
import { signIn } from "../actions/auth";
import Link from "next/link";
import {Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(signIn,null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-clinica-light to-blue-50 px-5">
            <div className="w-full max-w-md bg-clinica-light rounded-2xl shadow-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-clinica-light flex items-center justify-center">
            <Image
                    src="/diente-icon.png"
                    alt="Icono de diente"
                    width={60}
                    height={60}
                />
            </div>
            
            <h1 className="text-2xl font-inter font-bold text-clinica-dark mb-2 text-center">
            Bienvenido de vuelta
            </h1>
            <p className="text-center text-clinica-accent font-sans mt-1 mb-6">
            Inicia sesión para gestionar tu bienestar dental.
            </p>

            {state?.error &&(
                <p className="text-red-500 text-sm text-center mb-4">{state.error}</p>
            )}

            <form action={formAction} className="flex flex-col gap-4">
            
            {/* Apartado del correo electrónico */}
            <div>
                <label className="block text-sm font-inter font-semibold text-clinica-accent" htmlFor="email">
                    Correo Electrónico
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="nombre@ejemplo.com"
                        className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                    />
                </div>
            </div>

            {/* Apartado de la contraseña */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-inter font-semibold text-clinica-accent">
                        Contraseña
                    </label>
                    <Link href="/forgot-password" className="text-sm font-inter font-semibold text-clinica-accent opacity-75 hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-clinica-dark"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Botón de inicio de sesión */}
            <button
                type="submit"
                disabled={pending}
                className="font-inter font-bold bg-clinica-dark text-clinica-light p-3 rounded-lg disabled:opacity-50 hover:bg-clinica-medium transition-colors" 
            >
                {pending ? "Entrando..":"Iniciar Sesión"}
            </button>
        </form>
            {/* Apartado de registro */}
            <p className="font-inter font-medium text-clinica-dark text-sm text-center mt-6">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="font-inter font-semibold text-clinica-accent opacity-70 hover:underline">
                Regístrate
                </Link>
            </p>
        </div>
        </div>
    );
}